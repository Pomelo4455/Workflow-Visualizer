import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const TaskGraph = ({ tasks, onTaskClick, filterTokenAddress }) => {
  const svgRef = useRef();

  useEffect(() => {
    const filteredTasks = tasks.filter(
      (task) =>
        task.taskConfig.recipient
          ?.toLowerCase()
          .includes(filterTokenAddress.toLowerCase()) ||
        task.tokensSource
          ?.toLowerCase()
          .includes(filterTokenAddress.toLowerCase())
    );

    const nodes = [];
    const links = [];

    filteredTasks.forEach((task) => {
      const taskId = task.name;
      const prevConnectorId = task.taskConfig.previousBalanceConnector;
      const nextConnectorId = task.taskConfig.nextBalanceConnector;

      nodes.push({ id: taskId, type: "task", task });

      if (
        prevConnectorId ===
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        nodes.push({ id: "Initiation", type: "balance" });
        links.push({ source: "Initiation", target: taskId });
      } else {
        nodes.push({ id: prevConnectorId, type: "balance" });
        links.push({ source: prevConnectorId, target: taskId });
      }

      if (
        nextConnectorId ===
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        nodes.push({ id: "Completion", type: "balance" });
        links.push({ source: taskId, target: "Completion" });
      } else {
        nodes.push({ id: nextConnectorId, type: "balance" });
        links.push({ source: taskId, target: nextConnectorId });
      }
    });

    const uniqueNodes = Array.from(
      new Set(nodes.map((d) => JSON.stringify(d)))
    ).map((d) => JSON.parse(d));

    const svg = d3.select(svgRef.current);

    const simulation = d3
      .forceSimulation(uniqueNodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(25)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force(
        "center",
        d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2)
      );

    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .style("stroke", "#999")
      .style("stroke-opacity", 0.6);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#6e5ce639")
      .style("padding", "6px")
      .style("border-radius", "10px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("color", "#FFFFFF")
      .style(
        "text-shadow",
        "1px 1px 0 #000, -1px -1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000"
      );

    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(uniqueNodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", (d) => (d.type === "task" ? 8 : 12))
      .attr("fill", (d) => (d.type === "task" ? "#FFFFFF" : "#6F5CE6"))
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", (event, d) => {
        if (d.type === "task") {
          onTaskClick(d.task);
        }
      })
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(d.id)
          .style("left", event.pageX + 5 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    simulation.nodes(uniqueNodes).on("tick", ticked);

    simulation.force("link").links(links);

    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    const resize = () => {
      const width = 1000;
      const height = window.innerHeight * 0.8;

      svg.attr("width", width).attr("height", height);
      simulation
        .force("center", d3.forceCenter(width / 2, height / 2))
        .alpha(0.3)
        .restart();
    };

    resize();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      svg.selectAll("*").remove();
    };
  }, [tasks, onTaskClick, filterTokenAddress]);

  return <svg ref={svgRef}></svg>;
};

export default React.memo(TaskGraph);
