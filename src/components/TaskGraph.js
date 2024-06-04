import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const TaskGraph = ({ tasks, onTaskClick, handleHighlightGroup }) => {
  const svgRef = useRef();
  const simulationRef = useRef(null); // Add a ref to store the simulation instance

  useEffect(() => {
    const generateNodesAndLinks = (tasks) => {
      const nodes = [];
      const links = [];
      const balanceIdToName = {};
      let currentLetterCode = 65; // ASCII code for 'A'

      tasks.forEach((task) => {
        const taskId = task.name;
        const prevConnectorId = task.taskConfig.previousBalanceConnector;
        const nextConnectorId = task.taskConfig.nextBalanceConnector;

        nodes.push({ id: taskId, type: "task", task });

        if (
          prevConnectorId ===
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        ) {
          nodes.push({ id: "Start", type: "balance" });
          links.push({ source: "Start", target: taskId });
        } else {
          if (!balanceIdToName[prevConnectorId]) {
            balanceIdToName[prevConnectorId] = String.fromCharCode(
              currentLetterCode++
            );
          }
          nodes.push({
            id: prevConnectorId,
            name: balanceIdToName[prevConnectorId],
            type: "balance",
          });
          links.push({ source: prevConnectorId, target: taskId });
        }

        if (
          nextConnectorId ===
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        ) {
          nodes.push({ id: "End", type: "balance" });
          links.push({ source: taskId, target: "End" });
        } else {
          if (!balanceIdToName[nextConnectorId]) {
            balanceIdToName[nextConnectorId] = String.fromCharCode(
              currentLetterCode++
            );
          }
          nodes.push({
            id: nextConnectorId,
            name: balanceIdToName[nextConnectorId],
            type: "balance",
          });
          links.push({ source: taskId, target: nextConnectorId });
        }
      });

      return {
        uniqueNodes: Array.from(
          new Set(nodes.map((d) => JSON.stringify(d)))
        ).map((d) => JSON.parse(d)),
        links,
      };
    };

    const initializeSVG = (nodes, links) => {
      const svg = d3.select(svgRef.current);

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(20)
        )
        .force("charge", d3.forceManyBody().strength(-200))
        .force(
          "center",
          d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2)
        );

      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#6F5CE6")
        .style("padding", "6px")
        .style("border-radius", "10px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("color", "#FFFFFF");

      svg
        .append("defs")
        .selectAll("marker")
        .data(["end"])
        .enter()
        .append("marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 7.5)
        .attr("refY", 0)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-3L6,0L0,3")
        .style("fill", "#999");

      const link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link")
        .style("stroke", "#999")
        .style("stroke-opacity", 0.6)
        .attr("marker-end", "url(#end)");

      const node = svg
        .append("g")
        .attr("class", "nodes")
        .style("cursor", "pointer")
        .selectAll("circle")
        .data(nodes)
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
            tooltip.transition().duration(500).style("opacity", 0);
          } else {
            if (d.id === "Start" || d.id === "End") {
              handleHighlightGroup(
                "0x0000000000000000000000000000000000000000000000000000000000000000"
              );
            }
            handleHighlightGroup(d.id);
            tooltip.transition().duration(500).style("opacity", 0);
          }
        })
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              d.type === "balance" && d.id !== "Start" && d.id !== "End"
                ? d.name
                : d.id
            )
            .style("left", event.pageX + 5 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      simulation.nodes(nodes).on("tick", ticked);
      simulation.force("link").links(links);

      function ticked() {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const radius = d.target.type === "balance" ? 11 : 8; // Adjust based on node type
            return d.target.x - (dx / distance) * radius;
          })
          .attr("y2", (d) => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const radius = d.target.type === "balance" ? 11 : 8; // Adjust based on node type
            return d.target.y - (dy / distance) * radius;
          });

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

      return simulation;
    };

    const { uniqueNodes, links } = generateNodesAndLinks(tasks);
    if (!simulationRef.current) {
      // Only initialize the SVG if the simulation does not already exist
      simulationRef.current = initializeSVG(uniqueNodes, links);
    } else {
      // Update the nodes and links if the simulation already exists
      const simulation = simulationRef.current;
      simulation.nodes(uniqueNodes);
      simulation.force("link").links(links);
      simulation.alpha(0.3).restart();
    }

    const resize = () => {
      const width = 1000;
      const height = window.innerHeight * 0.8;
      d3.select(svgRef.current).attr("width", width).attr("height", height);
      simulationRef.current
        .force("center", d3.forceCenter(width / 2, height / 2))
        .alpha(0.3)
        .restart();
    };

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      d3.select(svgRef.current).selectAll("*").remove();
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }
    };
  }, [tasks]); // Add dependencies array to control when the effect runs

  return <svg ref={svgRef}></svg>;
};

export default React.memo(TaskGraph);
