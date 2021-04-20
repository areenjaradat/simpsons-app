'use strict';
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extended:true}));
// Specify a directory for static resources
app.use(express.static('public'))
// define our method-override reference
app.use(methodOverride('_method'))
// Set the view engine for server-side templating
app.set('view engine', 'ejs')
// Use app cors


// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/',renderhome);
app.post('/addFav',addFavorite);
app.get('/favorite-quotes',renderFavorite);
app.get('/favorite-quotes/:quote_id',details);
app.put('/favorite-quotes/:quote_id',updateDetails);
app.delete('/favorite-quotes/:quote_id',deleteDetails);
// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --
function renderhome(request,response){
let arrayOfSimpsons=[];
    let url='https://thesimpsonsquoteapi.glitch.me/quotes?count=10'
    superagent.get(url).set('User-Agent', '1.0').then(results=>{
        arrayOfSimpsons=  results.body.map(element=> new Simpsons(element))
        response.render('index',{searchrResults:arrayOfSimpsons});
    })
   
}

function addFavorite(request,response){
    console.log(request.body)
let {quote,character,image,characterDirection}=request.body;
let SQL=`INSERT INTO simpsons (quote,character,image,characterDirection) VALUES($1,$2,$3,$4)`
let values=[quote,character,image,characterDirection]
client.query(SQL,values).then(()=>{
    response.redirect('favorite-quotes');
})
}

function renderFavorite(request,response){
    let SQL='SELECT * FROM simpsons';
    client.query(SQL).then(results=>{
        // console.log("renderFavorite",results.rows)
        response.render('favorite',{searchrResults:results.rows})
    })
}

function details(request,response){
    let id =request.params.quote_id;
    // console.log(id);
    let value=[id];
    let SQL='SELECT * FROM simpsons WHERE id=$1;';
    client.query(SQL,value).then(results=>{
        // console.log("renderFavorite",results.rows)
        response.render('datails',{searchrResults:results.rows})
    })
}


function updateDetails(request,response){
    console.log(request.params.quote_id);
    console.log(request.body)
    let id=request.params.quote_id;
    let {quote,character,image,characterDirection}=request.body;
    let values=[quote,character,image,characterDirection,id]
    let SQL='UPDATE simpsons SET quote=$1,character=$2,image=$3,characterDirection=$4 WHERE id=$5';
    client.query(SQL,values).then(()=>{
        response.redirect(`/favorite-quotes/${id}`)
    })
}


function deleteDetails(request,response){
    let id =request.params.quote_id;
    // console.log(id);
    let value=[id];
    let SQL='DELETE  FROM simpsons WHERE id=$1;';
    client.query(SQL,value).then(()=>{
        // console.log("renderFavorite",results.rows)
        response.redirect('/favorite-quotes');
    })
}

// helper functions
function Simpsons(data){
    this.quote=data.quote;
    this.character=data.character;
    this.image=data.image;
    this.characterDirection=data.characterDirection;
}
// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);
