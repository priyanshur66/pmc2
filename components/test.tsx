// @ts-nocheck
"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import InfluencerSetup2 from "./InfluencerSetup2";
import { useInfluencerData } from "@/store";
import { useDynamicContext } from "@/lib/dynamic";
import appwriteService from "@/appwrite/config";
import Spline from "@splinetool/react-spline";
import Script from "next/script";

function InfluencerSetup1() {
  const [choose, setChoose] = useState(true);
  const [name, setName] = useState<string>();
  const [bio, setBio] = useState<string>();
  const [newProfileImg, setNewProfileImg] = useState(
    "https://cloud.appwrite.io/v1/storage/buckets/661fea24623719ef827e/files/6640664400274b3e9f1a/view?project=65ff0caf1bc188ff5282&mode=admin"
  );
  const { user, isAuthenticated, setShowAuthFlow, handleLogOut } =
    useDynamicContext();
  const fileInputRef = useRef(null);
  function updateStore() {
    useInfluencerData.setState({
      name: name,
      bio: bio,
      publicKey: user?.verifiedCredentials[0].address,
      profile_img: newProfileImg,
    });
  }
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    try {
      const res = await appwriteService.uploadProilePic(file);
      console.log(res.href);
      setNewProfileImg(res.href);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  return (
    <>
      <div
        className={`w-[90%] justify-center gap-10 ${
          choose ? "flex" : "hidden"
        } `}
      >
        <div className="w-[50%] text-white flex flex-col gap-4 my-6">
          <p className="text-3xl font-semibold">Influencer Account Setup</p>
          <p>Give your account details</p>
          <div className="ml-2 flex flex-col gap-8">
            <div className="text-white  w-[20%]">
              <label className="mb-2 cursor-pointer">
                Your Picture
                <input
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  type="file"
                  name=""
                  id=""
                  style={{ display: "none" }}
                />
                <Image
                  src={newProfileImg}
                  width="252"
                  height="300"
                  alt="Ref3r logo"
                  onClick={handleImageClick}
                />
              </label>
            </div>

            <div className="flex flex-col w-[70%]">
              <label className="mb-2">Your Name</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                type="text"
                id="event-name"
                placeholder="Name"
                className="bg-[#27292D] rounded-xl p-2 outline-none"
              />
            </div>

            <div className="flex flex-col w-[70%]">
              <label className="mb-2">Your Bio</label>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                }}
                placeholder="Description..."
                rows={4}
                className="bg-[#27292D] rounded-xl p-2 outline-none resize-none"
              />
            </div>
            <button
              className="bg-[#00B24F] px-4 py-2 text-[0.8rem] text-white rounded-2xl md:rounded-lg w-[30%]"
              onClick={() => {
                setChoose(false);
                updateStore();
              }}
            >
              Save Details
            </button>
          </div>
        </div>

        <div className="w-[50%] h-[94vh] top-[3%] sticky rounded-2xl bg-black flex justify-center items-center">
          {/* <Image
            src="/User.svg"
            width="252"
            height="300"
            className="w-[100%] max-h-[85vh]"
            alt="Ref3r logo"
          /> */}
          <Spline scene="https://prod.spline.design/2rLQrhjlogSapElU/scene.splinecode" />
        </div>
      </div>
      {choose ? "" : <InfluencerSetup2 />}
    </>
  );
}

export default InfluencerSetup1;
