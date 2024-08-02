/********************* Import the required Packages *********************/
import EXPRESS from "express";

/********************* Create a router object using Express *********************/
const ROUTER = EXPRESS.Router();

/********************* Import The Controllers *********************/
import { TestGetRequest, TestPostRequest } from "../Controllers/TestControllers.js";

/********************* Declare The Routes And Bind With The Controller Methods *********************/
ROUTER.get("/testGetRequest", TestGetRequest);
ROUTER.post("/testPostRequest", TestPostRequest);

/********************* Export The Router *********************/
export default ROUTER;
