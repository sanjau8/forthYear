const mysql=require("mysql")
const express = require('express');
const app = express()


// Prevent Server from Crashing
process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
  });


// SQL Connection

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



//  Test URL
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


// Student Signup

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

// Student Login

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
            if(result.length==0){
                let temp={'action':'wrong-user'}
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
                let temp={'action':'wrong-password'}
                res.end(JSON.stringify(temp))   
            }
        }
            }
              
        
    });   
    

})

// visit in and out

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

                con.query(`delete from currentlyIn where rollNo='${rollNo}' and placeId='${placeid}'`, function (err, result) {
                    if (err){
                        console.log("connection failed"+err.stack)       
                    }
                    else{
                    console.log("Number of records deleted: " + result.affectedRows);
                    }
                  });

            }


            con.query(insql, function (err, result) {
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

//get current crowd

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

//Insert item by admin to masterItem
app.get("/itemInsert",function(req,res){

    const query=req.query
    var place=query.place
    var type=query.type
    var name=query.name
    var price=query.price
    res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
  res.setHeader('Access-Control-Allow-Credentials', true);
    const sql=`insert into masterItems(place,typee,itemName,price) values ('${place}','${type}','${name}','${price}')`;
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




// Auto Fill

app.get("/autoFill",function(req,res){

    const query=req.query
    var place=query.place
    var text=query.text
    text=text.toLowerCase();
    

    const sql=`select * from masterItems where place='${place}' and lower(itemName) like '%${text}%' `;
    con.query(sql, function (err, result) {
        var items=[];
    if (err) {
        console.log("connection failed"+err.stack)
        res.end(JSON.stringify(items))
        
            }
        else{
            if(result.length==0){
                res.end(JSON.stringify(items))
            }
            else{
            result.forEach(function(row){
                var id=row['itemId']
                var type=row['typee']
                var itemName=row['itemName']
                var price=row['price']
                var tp={'id':id,'type':type,'itemName':itemName,'price':price}
                items.push(tp)
            })
            res.end(JSON.stringify(items))
            }

            }              
        
    });   
})


// Add item

app.get("/addItem",function(req,res){

    const query=req.query
    var place=query.place
    var item=query.item

    const sql=`insert into items values (${place},${item},'IN')`;
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

// Remove item

app.get("/removeItem",function(req,res){

    const query=req.query
    var place=query.place
    var item=query.item

    const sql=`delete from items where placeId=${place} and itemId=${item}`;
    con.query(sql, function (err, result) {
    if (err) {
        console.log("connection failed"+err.stack)
        let temp={'action':'data-wrong-format'}
        res.end(JSON.stringify(temp))
            }
        else{
            console.log("1 record removed");
            let temp={'action':'record-deleted-successfully'}
            res.end(JSON.stringify(temp))
            }
              
        
    }); 


})

// Update Stock

app.get("/changeStockItem",function(req,res){

    const query=req.query
    var place=query.place
    var item=query.item
    var stock=query.stock

    const sql=`update items set stock='${stock}' where placeId=${place} and itemId=${item}`;
    con.query(sql, function (err, result) {
    if (err) {
        console.log("connection failed"+err.stack)
        let temp={'action':'data-wrong-format'}
        res.end(JSON.stringify(temp))
            }
        else{
            console.log("1 record changed");
            let temp={'action':'record-changed-successfully'}
            res.end(JSON.stringify(temp))
            }
              
        
    }); 


})




// view items


app.get("/viewItem",function(req,res){

    const query=req.query
    var place=query.place
    var stock=query.stock

    var arr=''
    if(stock=='in'){
        arr="('IN')"
    }
    else if(stock=='out'){
        arr="('OUT')"
    }
    else{
        arr="('IN','OUT')"
    }

    

    const sql=`select * from items natural join masterItems where placeId=${place} and stock in ${arr}`;
    con.query(sql, function (err, result) {
        var items=[]
    if (err) {
        console.log("connection failed"+err.stack)
        
        res.end(JSON.stringify(items))
            }
        else{
            if(result.length==0){
                
                res.end(JSON.stringify(items))
            }
            
            else{
                
                result.forEach(function(row){
                    var id=row['itemId']
                    var type=row['typee']
                    var itemName=row['itemName']
                    var price=row['price']
                    var stock=row['stock']
                    var tp={'id':id,'type':type,'itemName':itemName,'price':price,'stock':stock}
                    items.push(tp)
                })
             
                res.end(JSON.stringify(items))
                }
            }
              
        
    }); 


})

app.get("/viewslots",function(req,res){

    var query=req.query;
    var date=query["date"]
    var time=query["time"]

    const sql=`(select time(slot) as tim from bookings where date(slot)="${date}" group by time(slot) having count(*)=4 union select tim from times where tim<time("${time}"))  order by tim ;
    `;


    con.query(sql, function (err, result) {
        var times=new Set(["10:00:00","11:00:00","12:00:00","13:00:00","14:00:00","15:00:00","16:00:00","17:00:00","18:00:00","19:00:00"])
        
    if (err) {
        console.log("connection failed"+err.stack)
        
        res.end({})
            }
        else{
            if(result.length!=0){
                
                result.forEach(function(row){
                    
                    times.delete(row["tim"])
                   
                })
                
                
                }

                var result=[]
                Array.from(times).forEach(function(time){
                    result.push({"time":time})
                })
                res.end(JSON.stringify(result))
            }
              
        
    }); 

})


app.get("/book",function(req,res){
    var query=req.query
    var roll=query.roll
    var place=query.place
    var date=query.date
    var time=query.time

    const sql=`insert into bookings values ("${roll}","${place}",timestamp("${date}","${time}"))`;

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

app.get("/viewbook",function(req,res){
    var query=req.query
    var place=query.place
    var date=query.date


    const sql=`select rollNo,date(slot) as date, time(slot) as time, namee,phoneNo from bookings NATURAL JOIN users where placeid=${place} and date(slot)="${date}" order by slot`;
    con.query(sql, function (err, result) {
        var bookings=[]
    if (err) {
        console.log("connection failed"+err.stack)
        
        res.end(JSON.stringify(bookings))
            }
        else{
            if(result.length==0){
                
                res.end(JSON.stringify(bookings))
            }
            
            else{
                
                result.forEach(function(row){
                    var roll=row['rollNo']
                    
                    var name=row['namee']
                    var phone=row['phoneno']
                    var time=row['time']
                    var tp={'roll':roll,'date':date,'time':time,'name':name,'phone':phone}
                    bookings.push(tp)
                })
             
                res.end(JSON.stringify(bookings))
                }
            }
              
        
    }); 



})


app.listen(3000)
