import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import TripMap from "./TripMap";
import Arrow from "../assets/arrow.svg";
import Thumbtack from "../assets/thumbtack.png";
import Doodles from "../assets/doodles.png";

// Format minutes into hours and minutes
const formatDuration = (minutes) => {
  if (!minutes || typeof minutes !== "number" || minutes <= 0) {
    return "0 minutes";
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} ${mins === 1 ? "minute" : "minutes"}`;
  }
  if (mins === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  return `${hours} ${hours === 1 ? "hour" : "hours"} ${mins} ${mins === 1 ? "minute" : "minutes"}`;
};

export default function MemoriesPage() {
  const navigate = useNavigate();
  const [selectedItinerary, setSelectedItinerary] = useState(() => {
    const saved = localStorage.getItem("savedItinerary");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [photos, setPhotos] = useState(() => {
    // Don't load photos from localStorage to avoid quota issues
    // Photos will be stored only in memory
    return [];
  });
  
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("tripNotes");
    return saved ? JSON.parse(saved) : "";
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [fetchedMemories, setFetchedMemories] = useState([]);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [expandedMemory, setExpandedMemory] = useState(null);
  const [isViewingMemories, setIsViewingMemories] = useState(false);

  // Fetch memories from API
  const fetchMemories = async () => {
    console.log("🔍 Fetching memories...");
    setLoadingMemories(true);
    setIsViewingMemories(true);
    try {
      const token = sessionStorage.getItem("access_token");
      const email = sessionStorage.getItem("user_email") || "123@test.com";
      
      console.log("Fetching memories for email:", email);
      const response = await fetch(`/api/prod/getmemory?email=${email}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Memories fetched successfully:", data);
        console.log("🔍 Full memory objects:", JSON.stringify(data, null, 2));
        // Extract the memories array from the response
        const memoriesArray = data.memories || (Array.isArray(data) ? data : []);
        console.log("Setting memories:", memoriesArray);
        console.log("🔍 First memory structure:", memoriesArray[0]);
        console.log("🔍 All keys in first memory:", Object.keys(memoriesArray[0] || {}));
        if (memoriesArray[0] && memoriesArray[0].images) {
          console.log("🔍 First memory images:", memoriesArray[0].images);
          console.log("🔍 First image value:", memoriesArray[0].images[0]);
        }
        // Check all memories for image fields
        memoriesArray.forEach((mem, idx) => {
          console.log(`🔍 Memory ${idx + 1} keys:`, Object.keys(mem));
          console.log(`🔍 Memory ${idx + 1} has images:`, !!(mem.images && mem.images.length > 0));
          // Check if there are any URL fields
          if (mem.imageUrls) console.log(`🔍 Memory ${idx + 1} has imageUrls:`, mem.imageUrls);
          if (mem.signedUrls) console.log(`🔍 Memory ${idx + 1} has signedUrls:`, mem.signedUrls);
        });
        setFetchedMemories(memoriesArray);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch memories:", errorText);
        setFetchedMemories([]);
      }
    } catch (error) {
      console.error("Error fetching memories:", error);
      setFetchedMemories([]);
    } finally {
      setLoadingMemories(false);
    }
  };

  const handlePhotoUpload = (event) => {
    if (!selectedItinerary) {
      alert("Please select an itinerary first");
      return;
    }
    
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto = {
          id: Date.now(),
          src: e.target.result,
          itineraryId: selectedItinerary.tripId,
          uploadedAt: new Date().toISOString(),
          rotate: Math.random() * 20 - 10,
          delay: photos.filter(p => p.itineraryId === selectedItinerary.tripId).length * 0.1,
        };
        const updatedPhotos = [...photos, newPhoto];
        setPhotos(updatedPhotos);
        // Don't store photos in localStorage to avoid quota issues
        // Only save metadata
        const photoMetadata = updatedPhotos.map(p => ({
          id: p.id,
          itineraryId: p.itineraryId,
          uploadedAt: p.uploadedAt,
          rotate: p.rotate,
          delay: p.delay
        }));
        try {
          localStorage.setItem("photos_metadata", JSON.stringify(photoMetadata));
        } catch (e) {
          console.error("Could not save photo metadata:", e);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoRemove = (photoId) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    // Don't save to localStorage to avoid quota issues
    // Only update metadata
    const photoMetadata = updatedPhotos.map(p => ({
      id: p.id,
      itineraryId: p.itineraryId,
      uploadedAt: p.uploadedAt,
      rotate: p.rotate,
      delay: p.delay
    }));
    try {
      localStorage.setItem("photos_metadata", JSON.stringify(photoMetadata));
    } catch (e) {
      console.error("Could not save photo metadata:", e);
    }
  };

  const handleSaveNotes = () => {
    localStorage.setItem("tripNotes", JSON.stringify(notes));
    alert("Notes saved successfully!");
  };

  const handleSaveMemory = async () => {
    console.log("handleSaveMemory called", { selectedItinerary, photos, notes });
    
    if (!selectedItinerary) {
      alert("No itinerary to save");
      return;
    }

    alert("Attempting to save memory. Check console for details.");
    console.log("Saving memory...", { selectedItinerary, currentPhotos, notes });

    try {
      // Get user email from token or session
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        alert("You must be logged in to save memories");
        return;
      }

      const email = sessionStorage.getItem("user_email") || "123@test.com";

      // Get current photos for this itinerary
      const photosForItinerary = photos.filter(photo => photo.itineraryId === selectedItinerary.tripId);
      
      console.log("Photos to save:", photosForItinerary);

      // Convert photos to base64 array
      const images = photosForItinerary.map(photo => photo.src); // Already in base64 format
      
      const memoryData = {
        tripId: selectedItinerary.tripId,
        email: email,
        images: images,
        additionalInfo: notes || "Amazing trip!"
      };

      console.log("Memory data being sent to API:", {
        tripId: memoryData.tripId,
        email: memoryData.email,
        additionalInfo: memoryData.additionalInfo,
        imagesCount: images.length,
        firstImagePreview: images[0]?.substring(0, 100) + "..."
      });

      const response = await fetch("/api/prod/memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(memoryData)
      });

      console.log("Response status:", response.status);

      // Always save to localStorage as backup (without photos to avoid quota issues)
      const memory = {
        tripId: selectedItinerary.tripId,
        itinerary: selectedItinerary.itinerary,
        notes: notes,
        photoCount: photosForItinerary.length, // Store count instead of full images
        savedAt: new Date().toISOString(),
      };
      
      const savedMemories = localStorage.getItem("savedMemories");
      const memories = savedMemories ? JSON.parse(savedMemories) : [];
      
      const existingIndex = memories.findIndex(m => m.tripId === selectedItinerary.tripId);
      if (existingIndex >= 0) {
        memories[existingIndex] = memory;
      } else {
        memories.push(memory);
      }
      
      try {
        localStorage.setItem("savedMemories", JSON.stringify(memories));
        console.log("✅ Memory saved to localStorage");
      } catch (e) {
        console.error("Could not save to localStorage:", e);
        // Photos are already saved in memory in the 'photos' state
      }

      if (response.ok) {
        alert("Memory saved successfully to server!");
      } else {
        const errorText = await response.text();
        console.error("Failed to save memory to API:", errorText);
        alert("Memory saved locally but failed to upload to server. Check console for details.");
      }
    } catch (error) {
      console.error("Error saving memory:", error);
      alert(`Failed to save memory: ${error.message}`);
    }
  };

  // Filter photos for selected itinerary
  const currentPhotos = selectedItinerary 
    ? photos.filter(photo => photo.itineraryId === selectedItinerary.tripId)
    : [];

  // Build map places from itinerary
  const mapPlaces = selectedItinerary?.itinerary
    ? selectedItinerary.itinerary.map((it, idx) => ({
        title: it.spotname,
        coordinates: [it.coordinates.lon, it.coordinates.lat],
        address: it.reason,
        eventIndex: idx + 1,
      }))
    : [];


  return (
    <div className="min-h-screen w-screen bg-black text-white pt-24">
      <div className="px-5 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Memories</h1>
            <p className="text-white/70">Your saved trip itineraries and photo memories</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log("🔍 View Memories button clicked!");
                fetchMemories();
              }}
              className="flex items-center gap-2 rounded-full bg-black border-2 border-white text-white px-6 py-2 text-sm font-semibold hover:bg-white hover:text-black transition-all"
            >
              View Memories
              <img src={Arrow} alt="" className="w-4 h-4 rotate-45" />
            </button>
            {selectedItinerary ? (
              <button
                type="button"
                onClick={() => {
                  console.log("✅ Save Memory button CLICKED!", { selectedItinerary, photos: photos.length });
                  handleSaveMemory();
                }}
                className="flex items-center gap-2 rounded-full bg-white text-black px-6 py-2 text-sm font-semibold hover:bg-white/90 transition-all"
                style={{ zIndex: 9999 }}
              >
                <span className="text-xl">+</span>
                Save Memory
              </button>
            ) : (
              <button
                onClick={() => alert("Please save an itinerary from the Trip page first.")}
                className="flex items-center gap-2 rounded-full bg-white/30 text-white px-6 py-2 text-sm font-semibold cursor-not-allowed"
                disabled
              >
                <span className="text-xl">+</span>
                Save Memory
              </button>
            )}
          </div>
        </div>

        {/* Show memories list or main content */}
        {!isViewingMemories ? (
        <div className="flex gap-5">
          {/* Left Side - Itinerary + Map */}
          <div className="w-1/2 flex flex-col gap-5">
            {selectedItinerary ? (
              <>
                <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-semibold text-white mb-2">Your Saved Itinerary</h3>
                    <div className="flex gap-6 text-sm text-white/70">
                      {selectedItinerary.tripId && (
                        <div>
                          <span className="text-white/60">Trip ID:</span>{" "}
                          <span className="text-white font-mono">{selectedItinerary.tripId}</span>
                        </div>
                      )}
                      {selectedItinerary.duration && (
                        <div>
                          <span className="text-white/60">Duration:</span>{" "}
                          <span className="text-white">{formatDuration(selectedItinerary.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto">
                    {selectedItinerary.itinerary.map((item, idx) => (
                      <motion.div
                        key={`${item.spotname}-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-black/40 border border-white/20 rounded-lg p-4 hover:bg-black/60 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-black border-2 border-white flex items-center justify-center">
                            <span className="text-lg font-bold text-white">#{idx + 1}</span>
                          </div>
                          <h4 className="text-base font-semibold text-white">{item.spotname}</h4>
                        </div>
                        {item.reason && (
                          <p className="text-sm text-white/70 mb-3">{item.reason}</p>
                        )}
                        {item.reachtime && (
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <span className="font-medium">Arrival Time:</span>
                            <span className="text-white/80 font-mono">{item.reachtime}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Map Below Itinerary */}
                {mapPlaces.length > 0 && (
                  <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl overflow-hidden">
                    <div className="h-[400px]">
                      <TripMap places={mapPlaces} className="w-full h-full" />
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-semibold text-white mb-2">Takeaways</h3>
                    <p className="text-sm text-white/70">Add your thoughts, notes, or memories from this trip</p>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your notes here..."
                    className="w-full h-40 bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-white/50 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={handleSaveNotes}
                      className="rounded-full bg-white text-black px-6 py-2 text-sm font-semibold hover:bg-white/90 transition-all"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-6">
                <div className="text-center py-12 text-white/70">
                  <p className="text-lg mb-4">No saved itinerary yet.</p>
                  <p className="text-sm mb-6">Save an itinerary from the Trip page to view it here.</p>
                  <button
                    onClick={() => navigate("/trip")}
                    className="flex items-center gap-2 rounded-full bg-black border-2 border-white text-white px-6 py-2 text-sm font-semibold hover:bg-white hover:text-black transition-all mx-auto"
                  >
                    Go to Trip Planner
                    <img src={Arrow} alt="" className="w-4 h-4 rotate-45" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Polaroid Photo Gallery */}
          <div className="w-1/2">
            <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-6">
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-white mb-4">Photo Memories</h3>
                <label 
                  className={`rounded-full text-black px-6 py-2 text-sm font-semibold transition-all inline-block cursor-pointer ${
                    selectedItinerary 
                      ? "bg-white hover:bg-white/90" 
                      : "bg-white/30 cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (!selectedItinerary) {
                      e.preventDefault();
                      alert("Please save an itinerary from the Trip page first");
                    }
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">+</span>
                    Upload Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={!selectedItinerary}
                    className="hidden"
                  />
                </label>
              </div>

              <div 
                className="relative min-h-[400px] overflow-y-auto"
                style={{
                  backgroundImage: `url(${Doodles})`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: 'auto'
                }}
              >
                {currentPhotos.length === 0 ? (
                  <div className="text-center py-12 text-white/70">
                    <p>No photos yet.</p>
                    <p className="text-sm mt-2">
                      {selectedItinerary 
                        ? "Upload photos to create your memory board." 
                        : "Save an itinerary from the Trip page to start uploading photos."}
                    </p>
                  </div>
                ) : (
                  <div className="relative pb-20">
                    {currentPhotos.map((photo, idx) => {
                      // Alternate between left and right alignment
                      const isLeft = idx % 2 === 0;
                      const isLast = idx === currentPhotos.length - 1;
                      
                      return (
                        <div key={photo.id}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: isLeft ? -50 : 50, rotate: -10 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1,
                              x: 0,
                              rotate: photo.rotate
                            }}
                            transition={{ 
                              delay: photo.delay,
                              type: "spring",
                              stiffness: 200
                            }}
                            className={`bg-white p-2 shadow-2xl cursor-pointer hover:scale-105 transition-transform relative ${
                              isLeft ? "mr-auto max-w-[300px]" : "ml-auto max-w-[300px]"
                            }`}
                            style={{
                              marginBottom: isLast ? '0' : '40px',
                              transform: `rotate(${photo.rotate}deg)`,
                            }}
                          >
                            {/* Remove Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePhotoRemove(photo.id);
                              }}
                              className="absolute top-2 right-2 z-30 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg font-bold text-lg"
                            >
                              ×
                            </button>

                            {/* Thumbtack */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                              <img 
                                src={Thumbtack} 
                                alt="thumbtack" 
                                className="w-12 h-12 drop-shadow-lg"
                              />
                            </div>
                            
                            <div className="bg-gray-100 p-2 pt-4">
                              <img
                                src={photo.src}
                                alt={`Memory ${idx + 1}`}
                                className="w-full h-64 object-cover"
                              />
                            </div>
                            
                            {/* Bottom section of polaroid */}
                            <div className="bg-white p-3 pt-6">
                              <div className="h-8 text-center text-gray-600 text-sm font-semibold">
                                Memory #{idx + 1}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        ) : (
        /* Viewing Memories - Show only the memories list */
        <div className="w-full">
          {loadingMemories ? (
            <div className="text-center text-white/70 py-12">Loading memories...</div>
          ) : fetchedMemories.length > 0 ? (
            <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-6">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-3xl font-semibold text-white">Your Saved Memories</h3>
                <button
                  onClick={() => setIsViewingMemories(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                >
                  ← Back
                </button>
              </div>
              <div className="space-y-3">
                {fetchedMemories.map((memory, idx) => (
                  <div
                    key={idx}
                    className="bg-black/40 border border-white/20 rounded-lg p-4 hover:bg-black/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setExpandedMemory(expandedMemory === idx ? null : idx)}
                      >
                        <h4 className="text-lg font-semibold text-white">
                          Trip: {memory.tripId}
                        </h4>
                        {memory.additionalInfo && (
                          <p className="text-sm text-white/70 mt-1">{memory.additionalInfo}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="text-white/70 hover:text-white">
                          {expandedMemory === idx ? "▼" : "▶"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to delete this memory?")) {
                              const updatedMemories = fetchedMemories.filter((_, i) => i !== idx);
                              setFetchedMemories(updatedMemories);
                              // TODO: Call API to delete from server
                            }
                          }}
                          className="text-red-500 hover:text-red-700 transition-all p-1"
                          title="Delete memory"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {expandedMemory === idx && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        {console.log("🔍 Expanded memory:", memory)}
                        {/* Show images if they exist */}
                        {memory.images && memory.images.length > 0 ? (
                          <div className="mb-4">
                            <h5 className="text-white font-semibold mb-2">Photos ({memory.images.length})</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {memory.images.map((imgUrl, imgIdx) => {
                                console.log(`🔍 Image ${imgIdx + 1} URL:`, imgUrl);
                                return (
                                  <img
                                    key={imgIdx}
                                    src={imgUrl}
                                    alt={`Memory ${idx + 1} - Image ${imgIdx + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                    onError={(e) => {
                                      console.error(`❌ Error loading image ${imgIdx + 1}:`, imgUrl);
                                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="text-white/50 text-sm">No images available</p>
                        )}
                        
                        {/* Show itinerary if it exists */}
                        {memory.itinerary && Array.isArray(memory.itinerary) && memory.itinerary.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-white font-semibold mb-2">Itinerary ({memory.itinerary.length} stops)</h5>
                            <div className="space-y-2">
                              {memory.itinerary.map((stop, stopIdx) => (
                                <div key={stopIdx} className="bg-black/40 border border-white/10 rounded p-2">
                                  <p className="text-white text-sm">
                                    {stopIdx + 1}. {stop.spotname || stop.name || "Stop"}
                                  </p>
                                  {stop.reason && <p className="text-white/60 text-xs mt-1">{stop.reason}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-white/70 py-12">
              <p className="text-lg mb-4">No memories found.</p>
              <button
                onClick={() => setIsViewingMemories(false)}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all mt-4"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

