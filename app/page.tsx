"use client"

import { DetectorCard } from "@/components/DetectorCard";
import { EditDetectorOverlay } from "@/components/EditDetectorOverlay";
import Image from "next/image";
// import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyTemp, setApiKeyTemp] = useState<string>("");
  const [detectors, setDetectors] = useState<DetType[]>([]);
  const [availableDetectors, setAvailableDetectors] = useState<DetBaseType[]>([]);
  const [showEditOverlay, setShowEditOverlay] = useState<boolean>(false);
  const [editOverlayIndex, setEditOverlayIndex] = useState<number>(0);
  const [jsonDataUrl, setJsonDataUrl] = useState<string>("");
  const [yamlDataUrl, setYamlDataUrl] = useState<string>("");
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [lastButtonWasAdd, setLastButtonWasAdd] = useState<boolean>(false);

  useEffect(() => {
    // fetch detector configs
    fetch("/api/config").then((res) => res.json()).then((data) => {
      setApiKeyTemp((data.api_key ? data.api_key as string : "").substring(0, 15) + "...");
      setApiKey(data.api_key ? data.api_key as string : "");
      setDetectors(data.detectors as DetType[] ? data.detectors as DetType[] : []);
    });

    // fetch available detectors
    fetch("/api/detectors").then((res) => res.json()).then((data) => {
      setAvailableDetectors(data as DetBaseType[] ? data as DetBaseType[] : []);
    });
  }, []);

  useEffect(() => {
    // update json data url
    fetch("/api/config-json-pretty").then((res) => res.json()).then((data) => {
      setJsonDataUrl(`data:application/json,${encodeURIComponent(data)}`);
    });
    // update yaml data url
    fetch("/api/config-yaml-pretty").then((res) => res.json()).then((data) => {
      setYamlDataUrl(`data:application/yaml,${encodeURIComponent(data)}`);
    });
  }, [detectors, apiKey]);


  const saveDetectors = (detectors_to_save: DetType[]) => {
    // save detector configs
    fetch("/api/config/detectors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        detectors: detectors_to_save,
      }),
    });
  };


  const saveApiKey = (apiKey: string) => {
    // save api key
    fetch("/api/config/api_key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
      }),
    });
  }

  const makeNewDetector = async (detector: DetType) => {
    // make new detector
    const res = await fetch("/api/new-detector", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(detector),
    }).then((res) => res.json());
    return res;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-2">
      <div className="flex fixed top-5 right-5 gap-5">
        <a className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded" href={jsonDataUrl} download="detector-configs.json" >
          json
        </a>
        <a className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded" href={yamlDataUrl} download="detector-configs.yaml" >
          yaml
        </a>
      </div>
      <h1 className="text-4xl font-bold">Detector Configs</h1>
      {/* download button */}
      {/* <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" href="/api/config" download="detector-configs.json" > */}
      <div className="flex gap-2">
        <input className="border-2 border-gray-300 rounded-md p-2" type="text" placeholder="API Key" value={apiKeyTemp} onChange={(e) => setApiKeyTemp(e.target.value)} />
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => {
          setApiKey(apiKeyTemp);
          saveApiKey(apiKeyTemp);
        }}>
          Save
        </button>
      </div>
      <div className="flex flex-col items-center gap-2">
        {detectors && detectors.map((detector, index) => (
          <div className="flex flex-col items-center" key={index}>
            <DetectorCard detector={detector} index={index} onclick={() => {
              setEditOverlayIndex(index);
              setShowEditOverlay(true);
              setLastButtonWasAdd(false);
            }} />
          </div>
        ))}
      </div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => {
        setShowEditOverlay(true);
        setLastButtonWasAdd(true);
        setEditOverlayIndex(detectors.length);
        let detectors_copy = [...detectors, {
          name: "New Detector",
          query: "New Query?",
          id: "",
          config: {
            enabled: true,
            vid_config: {
              name: "webcam",
            },
            image: "",
            trigger_type: "time",
            cycle_time: 30,
          }
        }];
        setDetectors(detectors_copy);
      }}>
        Add Detector
      </button>
      { detectors.length > 0 && showEditOverlay &&
        <EditDetectorOverlay detector={detectors[editOverlayIndex]} detectors={availableDetectors} index={0} onSave={ async (e) => {
          if (e.isNewDetector) {
            const id = await makeNewDetector(e.detector);
            if (id === "Failed") return;
            e.detector.id = id;
          }
          setShowEditOverlay(false);
          let detectors_copy = [...detectors];
          detectors_copy[editOverlayIndex] = e.detector;
          setDetectors(detectors_copy);
          saveDetectors(detectors_copy);
        }} onDelete={() => {
          setShowEditOverlay(false);
          let detectors_copy = [...detectors];
          detectors_copy.splice(editOverlayIndex, 1);
          setDetectors(detectors_copy);
          saveDetectors(detectors_copy);
        }} onBack={() => {
          setShowEditOverlay(false);
          if (lastButtonWasAdd) {
            let detectors_copy = [...detectors];
            detectors_copy.splice(editOverlayIndex, 1);
            setDetectors(detectors_copy);
          }
        }} />
      }
    </main>
  );
}
