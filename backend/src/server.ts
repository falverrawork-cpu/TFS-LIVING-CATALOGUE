import express from "express";
import cors from "cors";
import {config} from "./config.js";

const app=express();
app.disable("x-powered-by");
app.use(cors({origin:config.FRONTEND_URL,credentials:true}));
app.use(express.json({limit:"2mb"}));

app.get("/api/health",(_request,response)=>response.json({status:"ok",service:"tfs-catalogue-backend"}));
app.get("/api/version",(_request,response)=>response.json({name:"TFS Living Catalogue API",version:"0.1.0"}));

app.use((_request,response)=>response.status(404).json({error:"Route not found"}));
app.use((error:unknown,_request:express.Request,response:express.Response,_next:express.NextFunction)=>{
  console.error(error);
  response.status(500).json({error:"The request could not be completed."});
});

app.listen(config.PORT,()=>console.log(`TFS Catalogue API listening on ${config.PORT}`));
