export function howManyBalanceConnectors(tasks) {
  let connectors = new Set();

  tasks.forEach((task) => {
    let prevConnector = task.taskConfig.previousBalanceConnector;
    let nextConnector = task.taskConfig.nextBalanceConnector;

    if (!connectors.has(nextConnector)) {
      connectors.add(nextConnector);
    }
    if (!connectors.has(prevConnector)) {
      connectors.add(prevConnector);
    }
  });

  return connectors;
}

export function groupTasks(tasks, connectors) {
  let groups = [];

  let specialFirstGroup = tasks.filter(
    (task) =>
      task.taskConfig.previousBalanceConnector ===
      "0x0000000000000000000000000000000000000000000000000000000000000000"
  );
  if (specialFirstGroup.length > 0) {
    groups.push({
      name: `Previous Balance Connector: 0x0000000000000000000000000000000000000000000000000000000000000000`,
      tasks: specialFirstGroup,
      groupBy: "previousBalanceConnector",
    });
  }

  for (let connector of connectors) {
    if (
      connector ===
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    )
      continue;

    let group = tasks.filter(
      (task) => task.taskConfig.previousBalanceConnector === connector
    );
    if (group.length > 0) {
      groups.push({
        name: `Previous Balance Connector: ${connector}`,
        tasks: group,
        groupBy: "previousBalanceConnector",
      });
    }
  }

  for (let connector of connectors) {
    if (
      connector ===
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    )
      continue;

    let group = tasks.filter(
      (task) => task.taskConfig.nextBalanceConnector === connector
    );
    if (group.length > 0) {
      groups.push({
        name: `Next Balance Connector: ${connector}`,
        tasks: group,
        groupBy: "nextBalanceConnector",
      });
    }
  }

  let specialLastGroup = tasks.filter(
    (task) =>
      task.taskConfig.nextBalanceConnector ===
      "0x0000000000000000000000000000000000000000000000000000000000000000"
  );
  if (specialLastGroup.length > 0) {
    groups.push({
      name: `Next Balance Connector: 0x0000000000000000000000000000000000000000000000000000000000000000`,
      tasks: specialLastGroup,
      groupBy: "nextBalanceConnector",
    });
  }

  let finalGroups = groups.map((group) => {
    let subdivisions = [];

    group.tasks.forEach((task) => {
      let found = false;
      for (let subdivision of subdivisions) {
        if (
          subdivision.tasks[0].taskConfig.previousBalanceConnector ===
            task.taskConfig.previousBalanceConnector &&
          subdivision.tasks[0].taskConfig.nextBalanceConnector ===
            task.taskConfig.nextBalanceConnector
        ) {
          subdivision.tasks.push(task);
          found = true;
          break;
        }
      }
      if (!found) {
        const subdivisionName =
          group.groupBy === "previousBalanceConnector"
            ? `Next Balance Connector: ${task.taskConfig.nextBalanceConnector}`
            : `Previous Balance Connector: ${task.taskConfig.previousBalanceConnector}`;

        subdivisions.push({
          name: subdivisionName,
          tasks: [task],
        });
      }
    });

    return { ...group, subdivisions };
  });

  return finalGroups;
}
