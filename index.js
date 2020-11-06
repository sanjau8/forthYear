const mysql=require("mysql")
const express = require('express');
const app = express()

const con=mysql.createConnection({
    host:"crowd.ciiyzqthmod9.us-east-1.rds.amazonaws.com",
    user:"admin",
    password:"garchomp",
    port:"3306",
    database:'crowd'
    
});
con.connect(function(err){
    if(err){
        console.log("connection failed"+err.stack)
        
    }
    else
    {
    console.log("connection successfull")    
    }
})
app.get("/",function(req,res){

    
    
    con.connect(function(err){
        if(err){
            console.log("connection failed"+err.stack)
            res.end("connection failed")
        }
        else{
        console.log("connection successfull")
        res.end("connection successful")
        }
    })
    
    

})

app.get("/signup",function(req,res){

    
    const query=req.query
    var name=query['name']
    var rollNo=query['rno']
    var phoneNo=query['pno']
    var email=query['mail']
    var pass=query['pass']

    
    
    const sql=`insert into users values ('${name}','${rollNo}','${phoneNo}','${email}','${pass}')`;
    con.query(sql, function (err, result) {
    if (err) {
        console.log("connection failed"+err.stack)
        let temp={'action':'data-wrong-format'}
        res.end(JSON.stringify(temp))
            }
        else{
            console.log("1 record inserted");
            let temp={'action':'record-inserted-successfully'}
            res.end(JSON.stringify(temp))
            }
              
        
    });   
    

})

app.get("/login",function(req,res){

    
    const query=req.query
    
    var rollNo=query['rno']
    
    var pass=query['pass']

    
    
    const sql=`select * from users where rollNo='${rollNo}'`;
    con.query(sql, function (err, result) {
    if (err) {
        console.log("connection failed"+err.stack)
        let temp={'action':'error-loging-in'}
        res.end(JSON.stringify(temp))
            }
        else{
            var actPass=result[0]['passwordd']
            if(pass==actPass){
            let temp=result[0]
            temp['action']="valid-user"
            delete temp['passwordd']
            res.end(JSON.stringify(temp))
            }
            else{
                let temp={'action':'wrong-user'}
                res.end(JSON.stringify(temp))   
            }
            }
              
        
    });   
    

})

app.get("/visit",function(req,res){

    const query=req.query
    
    var rollNo=query['rno']    
    var placeid=query['place']
    var time=query['time']
    var datee=query['date']

    const sql=`select timeIn from currentlyIn where rollNo='${rollNo}' and placeId='${placeid}'`;
    con.query(sql, function (err, result) {
    if (err) {
        console.log("connection failed"+err.stack)
        let temp={'action':'some-error'}
        res.end(JSON.stringify(temp))
            }
        else{
            var insql=""
            if(result.length==0){
                insql=`insert into currentlyIn values ('${rollNo}','${datee}','${placeid}','${time}')`
                var temp={'action':'welcome'}
                res.end(JSON.stringify(temp))

            }
            else{
                insql=`insert into visitHistory values ('${rollNo}','${datee}','${placeid}','${result[0]['timeIn']}','${time}')`
                var temp={'action':'see-you'}
                res.end(JSON.stringify(temp))

                con.query(`select timeIn from currentlyIn where rollNo='${rollNo}' and placeId='${placeid}'`, function (err, result) {
                    if (err){
                        console.log("connection failed"+err.stack)       
                    }
                    else{
                    console.log("Number of records deleted: " + result.affectedRows);
                    }
                  });

            }


            con.query(sql, function (err, result) {
                if (err) {
                    console.log("connection failed"+err.stack)
                    
                        }
                    else{
                        console.log("1 record inserted");
                        
                        }
                          
                    
                });   
        }
              
        
    }); 


})

app.get("/curByPlace",function(req,res){
    const query=req.query
    
       
    var placeid=parseInt(query['place'])
    

    const sql=`select count(placeId) as cnt from currentlyIn where placeId=${placeid}`;
    con.query(sql, function (err, result) {
    if (err) {
        console.log("connection failed"+err.stack)
        let temp={'action':'some-error'}
        res.end(JSON.stringify(temp))
            }
        else{
            var count=result[0]['cnt']
            let temp={'action':count}
            res.end(JSON.stringify(temp))  
            
            }
              
        
    });   

    
})



app.listen(3000)
