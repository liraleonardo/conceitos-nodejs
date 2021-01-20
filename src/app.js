const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid, v4 } = require('uuid');

const app = express();

function logRequests(request, response, next){
  const {method, url} = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;
  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

//middleware to validate some fields
function validateId(request, response, next){
  const { id } = request.params;
  if(!isUuid(id)){
    return response.status(400).json({error:"Invalid ID!"})
  }

  return next();
}

app.use(express.json());
app.use(cors());
app.use(logRequests);

const repositories = [];

/**
 *    {
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      }
 */

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const {url, title, techs} = request.body;
  const repository = {
    id: v4(),
    url: url,
    title: title,
    techs: techs,
    likes: 0
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", validateId, (request, response) => {
  const {url, title, techs} = request.body;
  const {id} = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(repositoryIndex < 0 ){
    return response.status(400).json({"error":"Repository not found!"})
  }

  const repository = {
    id, url, title, techs, likes:repositories[repositoryIndex].likes
  }

  repositories[repositoryIndex] = repository;

  return response.json(repository);
  
});

app.delete("/repositories/:id", validateId, (request, response) => {
  const {id} = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  if(repositoryIndex < 0 ){
    return response.status(400).json({"error":"Repository not found!"})
  }

  repositories.splice(repositoryIndex,1);

  return response.status(204).send();

});

app.post("/repositories/:id/like", validateId, (request, response) => {
  const {id} = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  if(repositoryIndex < 0 ){
    return response.status(400).json({"error":"Repository not found!"})
  }

  const {url, title, techs, likes} = repositories[repositoryIndex];

  const newLikes = likes + 1;

  const repository = {
    id, url, title, techs, likes:newLikes
  }

  repositories[repositoryIndex] = repository;

  return response.json(repository);
  
});

module.exports = app;
