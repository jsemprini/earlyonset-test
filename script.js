let apcData = []
let trendData = []

async function loadData(){

const apc = await fetch("1-APC-long.csv")
const trends = await fetch("2-Trends-long.csv")

const apcText = await apc.text()
const trendsText = await trends.text()

apcData = Papa.parse(apcText,{header:true}).data
trendData = Papa.parse(trendsText,{header:true}).data

populateFilters()
updateView()

}

function populateFilters(){

let sex = [...new Set(apcData.map(d=>d.Sex))]
let site = [...new Set(apcData.map(d=>d.Site))]

sex.forEach(s=>{
let o=document.createElement("option")
o.text=s
o.value=s
sexSelect.add(o)
})

site.forEach(s=>{
let o=document.createElement("option")
o.text=s
o.value=s
siteSelect.add(o)
})

}

function updateView(){

let view = viewSelect.value
let sex = sexSelect.value
let site = siteSelect.value

if(view==="apc"){
renderAPC(sex,site)
renderAPCTable(sex,site)
}else{
renderTrends(sex,site)
renderTrendTable(sex,site)
}

}

function renderAPC(sex,site){

let data = apcData.filter(d=>d.Sex===sex && d.Site===site)

data.forEach(d=>{
d.APC = +d.APC
d.Sig = +d.Sig
})

data.sort((a,b)=>b.APC-a.APC)

let states = data.map(d=>d.State)
let values = data.map(d=>d.APC)

let colors = data.map(d=>{
if(d.State==="Iowa"){
return d.Sig==1 ? "rgba(220,0,0,1)" : "rgba(220,0,0,0.25)"
}else{
return d.Sig==1 ? "rgba(120,120,120,1)" : "rgba(180,180,180,0.25)"
}
})

let trace = {
type:"bar",
orientation:"h",
y:states,
x:values,
marker:{color:colors}
}

let layout = {
yaxis:{autorange:"reversed"},
margin:{l:120}
}

Plotly.newPlot("chart",[trace],layout)

}

function renderTrends(sex,site){

let data = trendData.filter(d=>d.Sex===sex && d.Site===site)

let states = [...new Set(data.map(d=>d.State))]

let traces=[]

states.forEach(s=>{

let g = data.filter(d=>d.State===s)

g.forEach(d=>{
d.Year=+d.Year
d.Rate=+d.Rate
})

g.sort((a,b)=>a.Year-b.Year)

let trace={
x:g.map(d=>d.Year),
y:g.map(d=>d.Rate),
mode:"lines",
line:{
color:s==="Iowa"?"red":"lightgray",
width:s==="Iowa"?3:1
},
name:s==="Iowa"?"Iowa":"",
showlegend:s==="Iowa"
}

traces.push(trace)

})

Plotly.newPlot("chart",traces)

}

function renderAPCTable(sex,site){

let data = apcData.filter(d=>d.Sex===sex && d.Site===site)

data.forEach(d=>{
d.APC=+d.APC
})

data.sort((a,b)=>b.APC-a.APC)

let html="<table><tr><th>Rank</th><th>State</th><th>APC</th></tr>"

data.forEach((d,i)=>{
html+=`<tr><td>${i+1}</td><td>${d.State}</td><td>${d.APC.toFixed(2)}</td></tr>`
})

html+="</table>"

table.innerHTML=html

}

function renderTrendTable(sex,site){

let data = trendData.filter(d=>d.Sex===sex && d.Site===site && d.Year==2022)

data.forEach(d=>{
d.Rate=+d.Rate
})

data.sort((a,b)=>b.Rate-a.Rate)

let html="<table><tr><th>Rank</th><th>State</th><th>Rate</th></tr>"

data.forEach((d,i)=>{
html+=`<tr><td>${i+1}</td><td>${d.State}</td><td>${d.Rate.toFixed(2)}</td></tr>`
})

html+="</table>"

table.innerHTML=html

}

viewSelect.onchange=updateView
sexSelect.onchange=updateView
siteSelect.onchange=updateView

loadData()
