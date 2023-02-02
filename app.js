const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use = express.json();
let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
//API 1 SAMPLE 1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});
//API2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `
    SELECT
        *
    FROM
        todo
    WHERE
        id = ${todoId};`;
  const getToDo = await db.get(getTodo);
  response.send(getToDo);
});
//API3
app.post("/todos/", async (request, response) => {
  //const {  } = request.params;
  const { todoId, todo, priority, status } = request.query;
  const postDirectorList = `
    INSERT INTO
        todo (id, todo, priority, status)
    VALUES
        ('${todoId}', '${todo}','${priority}','${status}');`;
  await db.run(postDirectorList);
  response.send("Todo Successfully Added");
});
//API4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { search_q = "", status, priority } = request.query;
  let data = null;
  const updateQuery = "";
  switch (true) {
    case hasStatusProperty(request.query):
      updateQuery = `
       UPDATE todo
       SET todo = '${todo}',
       status= '${search_q}',
       priority = '${priority}'

       WHERE id = ${todoId};`;
      await db.run(updateQuery);
      response.send("Status Updated");
      break;
      updateQuery = `
       UPDATE todo
       SET priority= '${priority}'
       WHERE id = ${todoId};`;
      await db.run(updateQuery);
      response.send("Priority Updated");
      updateQuery = `
       UPDATE todo
       SET todo = '${todo}'
       WHERE id = ${todoId};`;
      await db.run(updateQuery);
      response.send("Todo Updated");
  }
});
//API5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});
module.exports = app;
