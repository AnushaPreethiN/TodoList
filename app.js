const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

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

// API1
app.get("/todos/", async (request, response) => {
 let data = null;
 let gettodoQuery = "";
 const { search_q = "", priority, status } = request.query;

 switch (true) {
  case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
   gettodoQuery = `
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
   gettodoQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
   break;
  case hasStatusProperty(request.query):
   gettodoQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
   break;
  default:
   gettodoQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
 }
 data = await database.all(gettodoQuery);
 response.send(data);
});

//API2
app.get("/books/:bookId/", async (request, response) => {
  const { todoId } = request.params;
  const gettodoQuery = `SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await db.get(gettodoQuery);
  response.send(todo);
});

//API3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const {
    id,
    todo,
    priority,
    status,
  } = todoDetails;
  const addtodoQuery = `INSERT INTO
      todo (id,todo,priority,status)
    VALUES
      (
        ${id},
        '${todo}',
        '${priority}',
        '${status}',
      );`;

  const dbResponse = await db.run(addtodoQuery);
  const todoId = dbResponse.lastID;
  response.send({ id: todoId });
});

//API4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = ""
  const todoDetails = request.body;
  switch (true) {
      case todoDetails.status !== undefined:
          updateColumn = "Status";
          break;
      case todoDetails.priority !== undefined:
          updateColumn = "Priority";
          break;
      case todoDetails.todo !== undefined:
          updateColumn = "Todo";
          break;
  }
  const previousTodoQuery ={
      `SELECT * FROM todo WHERE id=${todoId};`
  }
  const previousTodo = await database.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
   priority = previousTodo.priority,
   status = previousTodo.status,
  } = request.body;
  const updatetodoQuery = `UPDATE
      todo
    SET
      todo='${todo}',
      priority=${priority},
      status=${status},
    WHERE
      id = ${todoId};`;
  await db.run(updatetodoQuery);
  response.send(`${updateColumn} updated`);
});

//API5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletetodoQuery = `DELETE FROM 
      todo
    WHERE
      id = ${todoId};`;
  await db.run(deletetodoQuery);
  response.send("Todo Deleted");
});

//Get Author Books API

