let data = [];

let priceChart = null;
let forecastChart = null;
let volumeChart = null;

let currentPeriod = "all";

const $ = id => document.getElementById(id);


function num(v){

const n = Number(v);

return Number.isFinite(n) ? n : null;

}


function prices(){

return data
.map(x => num(x.close))
.filter(x => x !== null);

}


function volumes(){

return data.map(x => num(x.volume) || 0);

}


function avg(arr){

if(!arr.length) return 0;

return arr.reduce((a,b)=>a+b,0) / arr.length;

}


function fmt(v){

if(
v === null ||
v === undefined ||
!Number.isFinite(v)
){
return "-";
}

if(Math.abs(v) < 1){

return v.toFixed(4);

}

return v.toLocaleString(
undefined,
{
maximumFractionDigits:2
}
);

}


function movingAverage(arr,n){

if(arr.length < n){

return null;

}

return avg(
arr.slice(-n)
);

}


function rsi(arr,n=14){

if(arr.length < n+1){

return null;

}

let gain = 0;
let loss = 0;

for(
let i=arr.length-n;
i<arr.length;
i++
){

const d =
arr[i]-arr[i-1];

if(d>0){

gain += d;

}else{

loss -= d;

}

}

if(loss===0){

return 100;

}

const rs =
(gain/n)/(loss/n);

return 100-(100/(1+rs));

}


function ema(arr,n){

if(!arr.length){

return 0;

}

const k =
2/(n+1);

let e=arr[0];

for(
let i=1;
i<arr.length;
i++
){

e =
arr[i]*k +
e*(1-k);

}

return e;

}


function macd(arr){

if(arr.length<26){

return null;

}

return (
ema(arr,12) -
ema(arr,26)
);

}


function stochastic(arr,n=14){

if(arr.length<n){

return null;

}

const recent =
arr.slice(-n);

const high =
Math.max(...recent);

const low =
Math.min(...recent);

if(high===low){

return 50;

}

return (
(arr[arr.length-1]-low) /
(high-low)
)*100;

}


function volatility(arr){

if(arr.length<2){

return 0;

}

const returns=[];

for(
let i=1;
i<arr.length;
i++
){

if(arr[i-1]!==0){

returns.push(
(arr[i]-arr[i-1]) /
arr[i-1]
);

}

}

if(!returns.length){

return 0;

}

const m=avg(returns);

const variance=
avg(
returns.map(
x=>(x-m)**2
)
);

return Math.sqrt(variance)*100;

}


function regression(arr,days){

if(arr.length<2){

return null;

}

const n=
Math.min(
arr.length,
60
);

const y=
arr.slice(-n);

let sx=0;
let sy=0;
let sxy=0;
let sx2=0;

for(
let i=0;
i<n;
i++
){

sx+=i;
sy+=y[i];
sxy+=i*y[i];
sx2+=i*i;

}

const denominator=
n*sx2-sx*sx;

if(!denominator){

return y[n-1];

}

const slope=
(n*sxy-sx*sy) /
denominator;

const intercept=
(sy-slope*sx)/n;

return (
intercept +
slope*(n-1+days)
);

}


function calculateSignal(p){

const ma20=
movingAverage(p,20);

const ma60=
movingAverage(p,60);

const r=
rsi(p);

const m=
macd(p);

let score=0;

if(ma20!==null){

score +=
p[p.length-1]>ma20
? 1
: -1;

}

if(ma60!==null){

score +=
p[p.length-1]>ma60
? 1
: -1;

}

if(r!==null){

if(r<30) score++;

if(r>70) score--;

}

if(m!==null){

score +=
m>0 ? 1 : -1;

}

if(score>=2){

return "매수";

}

if(score<=-2){

return "매도";

}

return "관망";

}


function getPeriodData(){

if(currentPeriod==="all"){

return data;

}

return data.slice(
-Number(currentPeriod)
);

}


function updatePrice(){

const p=prices();

if(!p.length){

return;

}

const now=
p[p.length-1];

const prev=
p.length>1
?p[p.length-2]
:now;

const change=
now-prev;

const percent=
prev!==0
?(change/prev)*100
:0;

$("currentPrice")
.textContent=
fmt(now);

$("priceChange")
.textContent=
`${change>=0?"+":""}${fmt(change)}
(${percent>=0?"+":""}${percent.toFixed(2)}%)`;

$("priceChange").className=
"change "+
(
change>0
?"up"
:change<0
?"down"
:"neutral"
);

}


function updateIndicators(){

const p=prices();

const ma20=
movingAverage(p,20);

const ma60=
movingAverage(p,60);

const r=
rsi(p);

const m=
macd(p);

const st=
stochastic(p);

const v=
volatility(p);

$("ma20").textContent=
fmt(ma20);

$("ma60").textContent=
fmt(ma60);

$("rsi").textContent=
r===null
?"-"
:r.toFixed(1);

$("macd").textContent=
m===null
?"-"
:fmt(m);

$("stoch").textContent=
st===null
?"-"
:st.toFixed(1);

$("volatility")
.textContent=
v.toFixed(2)+"%";

const recent=
p.slice(-30);

$("high").textContent=
recent.length
?fmt(Math.max(...recent))
:"-";

$("low").textContent=
recent.length
?fmt(Math.min(...recent))
:"-";

const vols=
volumes();

$("volume").textContent=
vols.length
?Math.round(
vols[vols.length-1]
).toLocaleString()
:"-";

}


function updateForecast(){

const p=prices();

if(!p.length){

return;

}

const p7=
regression(p,7);

const p30=
regression(p,30);

$("pred7").textContent=
fmt(p7);

$("pred30").textContent=
fmt(p30);

const signal=
calculateSignal(p);

$("signal").textContent=
signal;

$("signal").className=
signal==="매수"
?"up"
:signal==="매도"
?"down"
:"neutral";

const current=
p[p.length-1];

const v=
volatility(p);

let confidence=
100-v*3;

confidence=
Math.max(
20,
Math.min(
95,
confidence
)
);

let text="";

if(signal==="매수"){

text+="현재 기술적 지표는 상승 쪽에 무게가 있습니다. ";

}else if(signal==="매도"){

text+="현재 기술적 지표는 하락 쪽에 무게가 있습니다. ";

}else{

text+="현재 기술적 지표가 혼재되어 관망 구간입니다. ";

}

if(p7!==null){

const diff=
((p7-current)/current)*100;

text+=
`7일 통계 예상가격은 ${fmt(p7)}
(${diff>=0?"+":""}${diff.toFixed(2)}%)입니다. `;

}

if(p30!==null){

const diff=
((p30-current)/current)*100;

text+=
`30일 예상가격은 ${fmt(p30)}
(${diff>=0?"+":""}${diff.toFixed(2)}%)입니다. `;

}

text+=
`최근 변동성 ${v.toFixed(2)}%,
계산 신뢰도 약 ${confidence.toFixed(0)}%입니다. `;

text+=
"※ 예상가격은 과거 가격과 기술적 지표를 이용한 통계적 추정입니다.";

$("analysisText")
.textContent=text;

}


/* =========================
   ⭐ 실제 주가 그래프
   ========================= */

   function makePriceChart(){

   const d=
   getPeriodData();

   const labels=
   d.map(x=>x.date);

   const values=
   d.map(
   x=>num(x.close)||0
   );

   if(priceChart){

   priceChart.destroy();

   }

   priceChart=
   new Chart(
   $("priceChart"),
   {

   type:"line",

   data:{

   labels:labels,

   datasets:[

   {

   label:"주가",

   data:values,

   borderWidth:2,

   pointRadius:0,

   pointHoverRadius:6,

   tension:.18,

   fill:false

   }

   ]

   },

   options:{

   responsive:true,

   maintainAspectRatio:false,

   interaction:{

   mode:"index",

   intersect:false

   },

   plugins:{

   legend:{

   display:false

   },

   tooltip:{

   enabled:true,

   displayColors:false,

   callbacks:{

   title:function(items){

   return "📅 "+items[0].label;

   },

   label:function(item){

   return "💰 주가: "+fmt(item.raw);

   }

   }

   }

   },

   scales:{

   x:{

   ticks:{

   maxTicksLimit:8,

   maxRotation:0

   },

   grid:{

   display:false

   }

   },

   y:{

   ticks:{

   callback:function(value){

   return fmt(value);

   }

   }

   }

   }

   }

   );

   }


   /* =========================
      예상가격 그래프
      ========================= */

      function makeForecastChart(){

      const p=prices();

      if(!p.length){

      return;

      }

      const current=
      p[p.length-1];

      const p7=
      regression(p,7);

      const p30=
      regression(p,30);

      if(forecastChart){

      forecastChart.destroy();

      }

      forecastChart=
      new Chart(
      $("forecastChart"),
      {

      type:"line",

      data:{

      labels:[
      "현재",
      "+7일",
      "+30일"
      ],

      datasets:[

      {

      label:"예상가격",

      data:[
      current,
      p7,
      p30
      ],

      borderWidth:2,

      pointRadius:6,

      tension:.25

      }

      ]

      },

      options:{

      responsive:true,

      maintainAspectRatio:false,

      plugins:{

      legend:{
      display:false
      },

      tooltip:{

      callbacks:{

      label:function(item){

      return "예상가격: "+
      fmt(item.raw);

      }

      }

      }

      }

      }

      }

      );

      }


      /* =========================
         거래량 그래프
         ========================= */

         function makeVolumeChart(){

         const d=
         getPeriodData();

         const labels=
         d.map(x=>x.date);

         const values=
         d.map(
         x=>num(x.volume)||0
         );

         if(volumeChart){

         volumeChart.destroy();

         }

         volumeChart=
         new Chart(
         $("volumeChart"),
         {

         type:"bar",

         data:{

         labels:labels,

         datasets:[

         {

         label:"거래량",

         data:values,

         borderWidth:0

         }

         ]

         },

         options:{

         responsive:true,

         maintainAspectRatio:false,

         plugins:{

         legend:{
         display:false
         }

         },

         scales:{

         x:{

         ticks:{

         maxTicksLimit:8

         }

         }

         }

         }

         }

         );

         }


         function makeCharts(){

         makePriceChart();

         makeForecastChart();

         makeVolumeChart();

         }


         function updateInfo(){

         $("count").textContent=
         data.length.toLocaleString();

         $("startDate").textContent=
         data[0]?.date||"-";

         $("endDate").textContent=
         data[data.length-1]?.date||"-";

         $("status").textContent=
         data.length
         ?"정상"
         :"데이터 없음";

         }


         function render(){

         updatePrice();

         updateIndicators();

         updateForecast();

         updateInfo();

         makeCharts();

         }


         async function loadData(){

         $("status").textContent=
         "불러오는 중";

         try{

         const response=
         await fetch(
         "atch_stock_data.json?"+
         Date.now()
         );

         if(!response.ok){

         throw new Error(
         "atch_stock_data.json을 찾을 수 없습니다."
         );

         }

         const json=
         await response.json();

         if(!Array.isArray(json)){

         throw new Error(
         "주가 데이터 형식이 잘못되었습니다."
         );

         }

         data=
         json
         .filter(
         x =>
         x &&
         x.date &&
         num(x.close)!==null
         )
         .sort(
         (a,b)=>
         new Date(a.date)-
         new Date(b.date)
         );

         if(!data.length){

         throw new Error(
         "주가 데이터가 없습니다."
         );

         }

         render();

         }catch(error){

         console.error(error);

         $("status").textContent=
         "오류";

         $("analysisText")
         .textContent=
         "주가 데이터를 불러오지 못했습니다: "+
         error.message;

         }

         }


         function refreshData(){

         loadData();

         }


         function focusChart(){

         document
         .querySelector(".pricePanel")
         ?.scrollIntoView({
         behavior:"smooth"
         });

         }


         function focusAnalysis(){

         document
         .querySelector(".analysis")
         ?.scrollIntoView({
         behavior:"smooth"
         });

         }


         function scrollToTop(){

         window.scrollTo({

         top:0,

         behavior:"smooth"

         });

         }


         $("refreshBtn")
         .addEventListener(
         "click",
         refreshData
         );


         document
         .querySelectorAll(
         ".periodBox button"
         )
         .forEach(button=>{

         button.addEventListener(
         "click",
         ()=>{

         document
         .querySelectorAll(
         ".periodBox button"
         )
         .forEach(x=>
         x.classList.remove("active")
         );

         button.classList.add("active");

         currentPeriod=
         button.dataset.period;

         makeCharts();

         });

         });


         $("searchBtn")
         .addEventListener(
         "click",
         ()=>{

         const q=
         $("searchInput")
         .value
         .trim();

         if(!q){

         render();

         return;

         }

         const found=
         data.filter(x=>
         String(x.date)
         .includes(q)
         );

         if(found.length){

         data=found;

         render();

         }else{

         $("analysisText")
         .textContent=
         `"${q}" 날짜의 주가 데이터가 없습니다.`;

         }

         });


         document
         .addEventListener(
         "DOMContentLoaded",
         loadData
         );

         loadData();
