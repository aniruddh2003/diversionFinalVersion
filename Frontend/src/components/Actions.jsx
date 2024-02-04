import { features } from "../constants/constants";
import styles, { layout } from "../style";
import Button from "./Button";
import Card from "./Card";
import { feedback } from "../constants/constants";
import FileIcon from "../assets/file-icon.png";
import CodeIcon from "../assets/code-icon.png";
import TextIcon from "../assets/text-icon.png";
import { useState } from "react";

function Actions() {
  const [fileContent, setFileContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      console.error("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content);
        console.log(da);
      } else {
        console.error("Error uploading file:", response.statusText);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  return (
    <>
      <h2 className={styles.heading2}>What would you like to do?</h2>
      <section
        id="features"
        className="flex flex-col"
        style={{ backgroundColor: "black" }}
      >
        <div className={layout.sectionInfo}>
          <div className="absolute z-[0] w-[60%] h-[60%] -right-[50%] rounded-full blue__gradient" />

          <div className="w-full flex justify-between items-center md:flex-row flex-col sm:mb-16 mb-6 relative z-[1]"></div>

          <div className="flex  sm:justify-start justify-center w-full feedback-container relative z-[1]">
            <div className="flex flex-col justify-between px-10 py-12 rounded-[20px]  w-1/3 md:mr-10 sm:mr-5 mr-0 my-5 action-card  box-shadow glass">
              <input type="file" id="files" onChange={handleFileChange} />
              <div className="flex flex-col items-center p-2 justify-center">
                <img
                  src={FileIcon}
                  alt="double_quotes"
                  className="w-[42.6px] h-[27.6px] mb-4 object-contain text-white"
                />
                <h1 className="text-white text-sm text-center">
                  {"Upload a file"}
                </h1>
              </div>
              <button className="text-white mt-2" onClick={handleUploadFile}>
                Submit
              </button>
            </div>
            <div className="flex flex-col justify-between px-10 py-12 rounded-[20px]  w-1/3 md:mr-10 sm:mr-5 mr-0 my-5 action-card  box-shadow glass">
              <input type="file" id="files" onChange={handleFileChange} />
              <div className="flex flex-col items-center p-2 justify-center">
                <img
                  src={CodeIcon}
                  alt="double_quotes"
                  className="w-[42.6px] h-[27.6px] mb-4 object-contain text-white"
                />
                <h1 className="text-white text-sm text-center">{"Add code"}</h1>
              </div>
              <button className="text-white mt-2" onClick={handleUploadFile}>
                Submit
              </button>
            </div>
            <div className="flex flex-col justify-between px-10 py-12 rounded-[20px]  w-1/3 md:mr-10 sm:mr-5 mr-0 my-5 action-card  box-shadow glass">
              <input type="file" id="files" onChange={handleFileChange} />
              <div className="flex flex-col items-center p-2 justify-center">
                <img
                  src={TextIcon}
                  alt="double_quotes"
                  className="w-[42.6px] h-[27.6px] mb-4 object-contain text-white"
                />
                <h1 className="text-white text-sm text-center">{"Add Text"}</h1>
              </div>
              <button className="text-white mt-2" onClick={handleUploadFile}>
                Submit
              </button>
            </div>
          </div>
        </div>
        <div className="h-[40vh] w-full glass p-6 text-white overflow-scroll text-md">
          {fileContent}
          {console.log(fileContent)}
        </div>
      </section>
    </>
  );
}

export default Actions;
