import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Icon, Popup } from "semantic-ui-react";
import MapGroup from "../components/Group/MapGroup";
import SpinnerLoading from "../components/SpinnerLoading";
import Cropper from "react-easy-crop";
import getCroppedImg from "../reusable/cropImage";
import { postActions } from "../actions/postActions";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import uuid from "uuid";
import { AutosuggestExample } from "../components/Autosuggestion";

class PostUploadPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultImage:
        "https://static.vecteezy.com/system/resources/previews/006/086/203/non_2x/picture-gallery-interface-icon-vector.jpg",
      photo:
        "https://static.vecteezy.com/system/resources/previews/006/086/203/non_2x/picture-gallery-interface-icon-vector.jpg",
      description: "",
      locationName: "",
      coordinates: "",
      toggleCheckIn: false,
      selectedFile: null,
      crop: { x: 0, y: 0 },
      zoom: 1,
      croppedImage: null,
      aspect: 16 / 9,
      openAspect: false,
      isCrop: true,
      previewPhoto: null,
      //tags
      x: 50,
      y: 50,
      valueTags: "",
      displayInput: "none",
      submitOnClick: false,
    };
    this.fileInputRef = React.createRef();
  }
  //tags
  handleChangeTag = (value) => {
    this.setState({ valueTags: value, submitOnClick: false });
  };

  deleteTag = (e) => {
    const { dispatch } = this.props;
    dispatch({ type: "DELETE_IMAGE_TAG", id: e.target.id });
  };

  handleAddAutocompleteTag = (value) => {
    const { x, y } = this.state;
    const { dispatch } = this.props;
    if (value !== "") {
      dispatch({ type: "ADD_IMAGE_TAG", div: { x, y, value, id: uuid.v4() } });
      this.setState({
        displayInput: "none",
        submitOnClick: true,
      });
    }
  };

  handleAddTag = (e) => {
    e.preventDefault();
    const { x, y, valueTags } = this.state;
    const { dispatch } = this.props;
    if (valueTags !== "") {
      console.log("valueTags: " + valueTags);
      dispatch({
        type: "ADD_IMAGE_TAG",
        div: { x, y, value: valueTags, id: uuid.v4() },
      });
      this.setState({
        submitOnClick: true,
        displayInput: "none",
      });
    }
  };

  handleClickTag = (e) => {
    const x = Math.floor((e.nativeEvent.offsetX * 100) / e.target.width);
    const y = Math.floor((e.nativeEvent.offsetY * 100) / e.target.height);
    this.setState({ x, y, displayInput: "inline-block" });
  };

  handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setState({
          photo: e.target.result,
          previewPhoto: e.target.result,
          selectedFile: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  handleChangeImage = () => {
    this.fileInputRef.current.click();
  };

  handleLocationSelect = (location) => {
    this.setState({
      locationName: location.locationName,
      coordinates: location.coordinates,
    });
    console.log(location);
  };

  handleSubmit = (event) => {
    event.preventDefault();
    // this.showCroppedImage();
    const { description, locationName, coordinates, croppedImage } = this.state;
    const { dispatch, divs } = this.props;

    const formData = new FormData();
    formData.append("description", description);
    formData.append("file", croppedImage);
    formData.append("locationName", locationName);
    formData.append("tags", JSON.stringify(divs));
    formData.append("coordinates", coordinates);

    dispatch(postActions.addPost(formData));
  };

  componentDidUpdate(prevProps) {
    if (prevProps.uploading && !this.props.uploading) {
      window.location.href = "/profile";
    }
  }

  handleToggleCheckIn = () => {
    this.setState((prevState) => ({
      toggleCheckIn: !prevState.toggleCheckIn,
    }));
  };

  onCropChange = (crop) => {
    this.setState({ crop });
  };

  onCropComplete = async (croppedArea, croppedAreaPixels) => {
    const { photo } = this.state;
    try {
      const croppedImage = await getCroppedImg(photo, croppedAreaPixels);
      this.setState({
        croppedImage: croppedImage.file,
        previewPhoto: croppedImage.fileDataUrl,
      });
    } catch (e) {
      console.error(e);
    }
  };

  onZoomChange = (zoom) => {
    this.setState({ zoom });
  };

  changeAspect = (e) => {
    e.preventDefault();
    if (e.target.name === "1:1") {
      this.setState({ aspect: 1 });
    } else {
      this.setState({ aspect: 16 / 9 });
    }
  };

  toggleAspectOptions = (e) => {
    e.preventDefault();
    this.setState((prevState) => ({ openAspect: !prevState.openAspect }));
  };

  toggleCrop = (e) => {
    e.preventDefault();
    this.setState((prevState) => ({ isCrop: !prevState.isCrop }));
  };

  render() {
    const {
      photo,
      description,
      toggleCheckIn,
      previewPhoto,
      isCrop,
      x,
      y,
      submitOnClick,
      locationName
    } = this.state;
    const { uploading, divs } = this.props;

    const renderDivs = divs.map((div) => (
      <div
        key={div.id}
        className="text-box"
        style={{ top: div.y + "%", left: div.x + "%" }}
      >
        <div className="tooltip tooltip-top">
          {div.value}
          <Icon
            id={div.id}
            onClick={this.deleteTag}
            style={{ cursor: "pointer", marginLeft: "2px", color: "red" }}
            name="close"
          />
        </div>
      </div>
    ));

    return (
      <div className="bg-white  flex flex-col  mt-5 shadow-lg h-auto text-gray-600 transition-all duration-300 border-none z-10 sidebar card-border-primary p-4">
        <h1 class="text-2xl px-[16px] py-[8px] font-semibold text-center relative flex-1">
          Create Post
        </h1>
        <form onSubmit={this.handleSubmit} className="p-4">
          {!toggleCheckIn ? (
            <>
              <textarea
                placeholder="Write something ...."
                className="w-full outline-none bg-slate-100 p-4 rounded-xl mb-6 h-[60px]"
                value={description}
                onChange={(e) => this.setState({ description: e.target.value })}
              />
              <div className="">
                {this.state.photo === this.state.defaultImage ? (
                  <label
                    htmlFor="photo"
                    style={{
                      border: "1px solid #591bc5",
                    }}
                    className="flex flex-col w-full h-[140px] rounded-xl items-center justify-center cursor-pointer text-[#591bc5]"
                  >
                    <i className="fa-regular fa-image text-[32px]"></i>
                    <h5>Choose image</h5>
                  </label>
                ) : (
                  <div className="relative bg-slate-50 flex justify-center z-10">
                    <div className={`${isCrop ? "opacity-0" : "opacity-1"}`}>
                      <div className="add-image-tags">
                        <div
                          className="text-box"
                          style={{ top: y + "%", left: x + "%" }}
                        >
                          <div className="tooltip tooltip-top !w-[300px]">
                            <div className="add-tag-input !rounded-lg">
                              <AutosuggestExample
                                addTagPage={true}
                                submitOnClick={submitOnClick}
                                handleChange={this.handleChangeTag}
                                addAutocompleteTag={
                                  this.handleAddAutocompleteTag
                                }
                              />
                              <Button onClick={this.handleAddTag}>Add</Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <img
                            src={previewPhoto || photo}
                            alt="Preview"
                            style={{
                              maxWidth: "100%",
                              height: "auto",
                            }}
                            onClick={this.handleClickTag}
                          />
                        </div>
                        {renderDivs}
                      </div>
                    </div>

                    {isCrop ? (
                      <Cropper
                        image={photo}
                        crop={this.state.crop}
                        zoom={this.state.zoom}
                        aspect={this.state.aspect}
                        onCropChange={this.onCropChange}
                        onCropComplete={this.onCropComplete}
                        onZoomChange={this.onZoomChange}
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    ) : (
                      <></>
                    )}
                    <div className="absolute bottom-4 left-4 z-40">
                      <button
                        onClick={this.toggleAspectOptions}
                        className="bg-white hover:bg-gray-300  flex items-center justify-center w-10 h-10 rounded-full"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                          />
                        </svg>
                      </button>

                      {this.state.openAspect && (
                        <ul className="mb-2 absolute bottom-full text-[12px] md:text[14px] left-0 w-[80px] bg-black rounded-lg opacity-80 text-white flex flex-col">
                          <Button
                            className="!m-0 !py-3 !flex !items-center !justify-center !p-0 gap-x-2 !bg-transparent !text-white hover:!bg-gray-300 hover:!text-black"
                            name="1:1"
                            onClick={this.changeAspect}
                            size="massive"
                          >
                            1:1
                          </Button>
                          <Button
                            className="!m-0 !py-3 !flex !items-center !justify-center !p-0 gap-x-2 !bg-transparent !text-white hover:!bg-gray-300 hover:!text-black"
                            name="16:9"
                            onClick={this.changeAspect}
                            size="massive"
                          >
                            16:9
                          </Button>
                        </ul>
                      )}
                    </div>
                    <span
                      className="w-[32px] h-[32px] absolute top-4 right-4 rounded-full flex items-center justify-center bg-white text-[#591bc5] cursor-pointer"
                      onClick={this.handleChangeImage}
                    >
                      <i className="fa-solid fa-rotate-left"></i>
                    </span>

                    <span
                      onClick={this.toggleCrop}
                      className={`w-[32px] h-[32px] absolute top-4 right-16 rounded-full flex items-center justify-center bg-white text-[#591bc5] cursor-pointer transition ${
                        isCrop ? "bg-[#591bc5] !text-white" : ""
                      }`}
                    >
                      <i className="fa-solid fa-crop-simple"></i>
                    </span>

                    {isCrop ? (
                      <span
                        onClick={this.toggleCrop}
                        className="w-[32px] h-[32px] absolute bottom-4 right-8 rounded-full flex items-center justify-center bg-white text-[#591bc5] cursor-pointer"
                      >
                        <i className="fa-solid fa-check"></i>
                      </span>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  hidden
                  ref={this.fileInputRef}
                  onChange={this.handleFileChange}
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-300 rounded-lg  text-[14px] mt-4 cursor-pointer">
                  <h1>Add location to your post:</h1>
                  <div className="flex items-center gap-1" onClick={this.handleToggleCheckIn}>
                    <Popup
                      content="Check in"
                      trigger={
                        <div className="cursor-pointer text-red-500 hover:bg-gray-400 w-[32px] h-[32px] rounded-full flex items-center justify-center text-[20px]">
                          <i className="fa-solid fa-location-dot"></i>
                        </div>
                      }
                    />
                    <h1>{locationName}</h1>
                  </div>
                </div>

              <div className="flex items-center justify-center py-4">
                <Button
                  type="submit"
                  className="!bg-[#591bc5] !text-white relative w-36 h-[32px]"
                >
                  {uploading ? (
                    <SpinnerLoading size={36} bgColor="#591BC5" />
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div
                className="flex items-center gap-4 justify-between"
                onClick={this.handleToggleCheckIn}
              >
                <h1 className=" text-[16px] font-medium flex-1 text-center">
                  Set Location
                </h1>
                <Popup
                  content="Check in"
                  trigger={
                    <div className="cursor-pointer text-white hover:bg-gray-400 bg-gray-300 w-[32px] h-[32px] rounded-full flex items-center justify-center text-[16px]">
                      <i className="fa-solid fa-right-long"></i>
                    </div>
                  }
                />
              </div>
              <div className="py-2 overflow-hidden">
                <MapGroup onLocationSelect={this.handleLocationSelect} />
              </div>
            </>
          )}
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.data,
  uploading: state.postUpload.uploading,
  divs: state.postUpload.divs,
});

export default connect(mapStateToProps)(PostUploadPage);
