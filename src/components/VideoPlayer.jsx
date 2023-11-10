import React, { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import ffmpeg from "ffmpeg.js/ffmpeg-mp4.js";
import "./videoPlayer.css";

function VideoPlayer() {
  const [videoSrc, setVideoSrc] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasAudio, setHasAudio] = useState(false);
    const [metadata, setMetadata] = useState({
      duration: 0,
      width: 0,
      height: 0,
      type: "",
    });
    const videoRef = useRef(null);
      const canvasRef = useRef(null);
  const waveformRef = useRef(null);
  let wavesurfer = null;

useEffect(() => {
    if (videoSrc) {
        const video = videoRef.current;
        console.log("videoSrc : ", videoSrc);
        video.src = videoSrc;
        video.load();
        video.addEventListener("loadedmetadata", () => {
            console.log("video", {...video});
        setMetadata({
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            type: video.type,
        });
        });
    wavesurfer = WaveSurfer.create({
    container: waveformRef.current,
    waveColor: "blue",
    progressColor: "purple",
    });
    wavesurfer.load(videoSrc);
    wavesurfer.on("ready", () => {
    waveformRef.current = wavesurfer;
    });
    return () => {
    wavesurfer.destroy();
        };
}
}, [videoSrc]);
    
const analyzeVideo = async (file) => {
    const data = await file.arrayBuffer();
    const result = ffmpeg({
      MEMFS: [{ name: "input.mp4", data }],
      arguments: [
        "-i",
        "input.mp4",
        "-vn",
        "-c:a",
        "copy",
        "-f",
        "null",
        "/dev/null",
      ],
      print: () => {},
      onExit: (code) => {
          if (code === 0) {
              return true;
          }
          else {
              return false;
          }
      },
    });
};

    
const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    const updatedMeta = { ...metadata, type: file.type };
    setMetadata(updatedMeta);
  if (file) {
    const url = URL.createObjectURL(file);
    const videoElement = document.createElement("video");
    // videoElement.preload = "metadata";
    //   videoElement.onloadedmetadata = () => {
        console.log("videoElement : ", videoElement);
      if (analyzeVideo(file)) {
        setVideoSrc(url);
      } else {
        alert("The uploaded file does not have audio. Please try again.");
      }
    // };
  }
};

const togglePlayPause = () => {
    if (isPlaying) {
        videoRef.current.pause();
    } else {
        videoRef.current.play();
    }
    waveformRef.current.playPause();
    setIsPlaying(!isPlaying);
};

  return (
    <div className="external-wrapper">
      <input type="file" accept="video/*" onChange={handleVideoSelect} />
      {videoSrc && (
        <div className="internal-wrapper">
          <div>
            <video ref={videoRef} src={videoSrc} />
            <div>
              <button onClick={togglePlayPause}>
                {isPlaying ? "Pause" : "Play"}
              </button>
            </div>
            <div ref={waveformRef} className="waveform"></div>
          </div>

          <div>
            <p>
              <span className="sub">Duration:</span>
              {metadata.duration.toFixed(2)} seconds
            </p>
            <p>
              <span className="sub">Width: </span>
              {metadata.width} pixels
            </p>
            <p>
              {" "}
              <span className="sub">Height: </span>
              {metadata.height} pixels
            </p>
            <p>
              <span className="sub">Video Type: </span>
              {metadata.type}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;