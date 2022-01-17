import React from 'react';
import ReactDOM from 'react-dom';
import { useState, useEffect } from "react";

// for transition between work and then break
function notifyUser(isBreak){
  if ( 'Notification' in window) {
    if (Notification.permission === 'granted'){
      doNotify(isBreak)
    }
    else {
      Notification.requestPermission().then(function(result) {
        console.log(result); // granted || denied
        if (Notification.permission == 'granted') {
          doNotify(isBreak);
        }
        // if (Notification.permission == "granted") {... do stuff}
        
      })
      .catch( (err) => {
        console.log(err);
      })
    }
  }
}

function doNotify(isBreak) {
  let title, options;
  if (isBreak === false) {
    title = "A reminder to rest your eyes"
    options = {
      body: "It's been 20 minutes since you last rested your eyes. Take a few seconds to prevent eye strain by looking away from your screen."
  }
}
  else {
    title = "20 seconds is up!"
    options = {
      body: "You may refocus on your task now and return your eyes to the screen."
    }
  }
  
  let n = new Notification(title, options)
  setTimeout(n.close.bind(n), 20000)
}




function Timer(){
  let initialTime = {work: {minutes: 20, seconds: 0},
                     break: {minutes: 0, seconds: 20}}
  let workColor = "#00CE9B"
  let breakColor = "#98CCFF"

  const [minutes, setMinutes] = useState(initialTime.work.minutes)
  const [seconds, setSeconds] = useState(initialTime.work.seconds)
  const [start, setStart] = useState(true)
  const [running, setRunning] = useState(0) // tells the timer to keep running
  const [isBreak, setIsBreak] = useState(false) //

  
  let timeout
  
  function decreaseTime() {  
    timeout = setTimeout(() => {
      if (minutes <= 0 && seconds <= 0) {
        
        notifyUser(isBreak)
       
        if (isBreak === false) {// work => break 
          setMinutes(initialTime.break.minutes)
          setSeconds(initialTime.break.seconds)
          setTimeout(() => setRunning(prev => prev + 1), 1000)
          
          // set color for timer ring 
          document.getElementById("base-timer-path-remaining").setAttribute("stroke", breakColor)
          document.getElementById("base-timer-label").style.color = breakColor;
        }
        else{ // break => work
          setMinutes(initialTime.work.minutes)
          setSeconds(initialTime.work.seconds)
          setTimeout(() => setRunning(prev => prev + 1), 1000)

          // set color for timer ring
          document.getElementById("base-timer-path-remaining").setAttribute("stroke", workColor)
          document.getElementById("base-timer-label").style.color = workColor;
        }
        setIsBreak(prev => !prev)

      }
      else if (seconds <= 0) {
          setMinutes(prev => prev - 1)
          setSeconds(prev => 59)
          setRunning(prev => prev + 1)
      }
      else {
          setSeconds(prev => prev - 1)
          setRunning(prev => prev + 1)
      }
     
    }, 1000)
    
    return () => {
      clearTimeout(timeout)
    }
  }
  
  useEffect(() => {
    decreaseTime()
    setCircleDasharray()
  }, [running])

  useEffect(() => {
    document.getElementById("base-timer-label").style.color = workColor;
    document.getElementById("base-timer-path-remaining").setAttribute("stroke", workColor);
   
  }, [])
  
  
  function calculateTimeFraction() {
    const TIME_LIMIT = (isBreak ? initialTime.break.minutes * 60 + initialTime.break.seconds : initialTime.work.minutes * 60 + initialTime.work.seconds);
    const rawTimeFraction = (minutes*60 + seconds)/ TIME_LIMIT; //change based on initial time!
    return (rawTimeFraction != 0 ? rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction) : 0);
  }
  
  function setCircleDasharray() {
    const circleDasharray = `${(
      calculateTimeFraction() * 283
      ).toFixed(0)} 283`;
     document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
  }

  
  return (
    <>
    <nav>
      <h2 className = "website-name">20-20 Timer</h2>
      <h2 className = "title">{isBreak ? "Break" : "Work"}</h2>
      {/* <input className = "work-minutes" type = "number" min = "0" max = "59" defaultValue = {initialTime.work.minutes} required></input> */}
      {/* <hr className = "top-divider"/> */}
      
    </nav>
    <div className = "interface">
      <div className = "base-timer">
        
        <svg className = "base-timer_svg" viewBox = "0 0 100 100" xmlns = "http://www.w3.org/2000/svg">
           <g className="base-timer__circle">
             
             <circle className="base-timer__path-elapsed" cx="50" cy="50" r="45" />
             
             <path
        id="base-timer-path-remaining"
        className= "base-timer__path-remaining green" 
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      />
          </g>
        </svg>
        
        <span id="base-timer-label" className="base-timer__label">
        
         <h1 id = "time-countdown">
        {seconds < 10 ? minutes + ":0" + seconds : minutes + ":" +    seconds} 
         </h1>
        </span>
      </div>
    </div>
      <div className = "buttons">
      <button className = "start-pause" onClick = {() => {
          if (start === true) {
            clearTimeout(timeout)
            setStart(prev => !prev)
          }
          else {
            decreaseTime()
            setStart(prev => !prev)
          }
        }}>{start === true ? "Pause" : "Start"}</button>
      <button className = "reset" onClick = {() => {
        if (isBreak === true) {
          setSeconds(initialTime.break.seconds)
          setMinutes(initialTime.break.minutes)
        }
        else {
          setSeconds(initialTime.work.seconds)
          setMinutes(initialTime.work.minutes)
        }
          clearTimeout(timeout)
          setStart(false)
          document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", "283 283");
        }}>Reset</button>
      </div>
    </>
  )
}


ReactDOM.render(
  <Timer />, document.getElementById("base")
)