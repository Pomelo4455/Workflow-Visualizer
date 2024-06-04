export function howManyBalanceConnectors(tasks) {
  let connectors = new Set();
  connectors.add(
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  );

  tasks.forEach((task) => {
    let prevConnector = task.taskConfig.previousBalanceConnector;
    let nextConnector = task.taskConfig.nextBalanceConnector;

    if (prevConnector) {
      connectors.add(prevConnector);
    }
    if (nextConnector) {
      connectors.add(nextConnector);
    }
  });

  return connectors;
}

export function groupTasks(tasks, connectors) {
  let groups = [];

  connectors.forEach((connector) => {
    const fromConnectorTasks = tasks.filter(
      (task) => task.taskConfig.previousBalanceConnector === connector
    );
    const toConnectorTasks = tasks.filter(
      (task) => task.taskConfig.nextBalanceConnector === connector
    );

    let subdivisions = [];

    if (fromConnectorTasks.length > 0) {
      subdivisions.push({
        name: `Tasks from ${connector}`,
        tasks: fromConnectorTasks,
      });
    }

    if (toConnectorTasks.length > 0) {
      subdivisions.push({
        name: `Tasks to ${connector}`,
        tasks: toConnectorTasks,
      });
    }

    groups.push({
      name: `Balance Connector: ${connector}`,
      tasks: [...fromConnectorTasks, ...toConnectorTasks],
      subdivisions,
    });
  });

  return groups;
}
