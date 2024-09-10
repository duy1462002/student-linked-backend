import React, { Component } from "react";
import { connect } from "react-redux";
import { groupActions } from "../actions/groupActions";
import SpinnerLoading from "../components/SpinnerLoading";

class MemberPage extends Component {
  componentDidMount = () => {
    const { members, currentGroup, dispatch } = this.props;

    let memberIds = currentGroup.members.map((member) => member.user);

    if (!members.length) {
      dispatch(groupActions.getGroupMembers(currentGroup._id, memberIds));
    }
  };

  render() {
    const { currentGroup, user, members, loadingMembers } = this.props;
    if (loadingMembers) {
      return (
        <div className="bg-white rounded-lg mt-[14px] p-4 w-2/3 relative min-h-[500px]">
          <SpinnerLoading size={80} bgColor="white" />
        </div>
      );
    } else
      return (
        <div className="bg-white rounded-lg mt-[14px] p-4 w-2/3">
          <h1 className="text-xl font-semibold ">
            Thành viên:{" "}
            <span className="font-normal">{currentGroup.members.length}</span>
          </h1>
          <p className="text-xl py-4">
            Các thanh viên tham gia nhóm này sẽ hiển thị tại đây
          </p>
          <div
            className="flex items-center gap-4 py-4"
            style={{
              borderTop: "1px solid #591bc5",
            }}
          >
            <img
              src={`/images/profile-picture/100x100/${user.profilePicture}`}
              alt="avatar"
              className="w-[60px] h-[60px] rounded-full "
            />
            <div className="">
              <h1 className="text-xl">
                {user.firstName + " " + user.lastName}
              </h1>
              <span className="text-lg font-semibold">Quản trị viên</span>
            </div>
          </div>
          <div>
            {members.map((member) => {
              if (member._id !== user._id) {
                return (
                  <div
                    key={member._id}
                    className="flex items-center gap-4 py-4"
                    style={{
                      borderTop: "1px solid #591bc5",
                    }}
                  >
                    <img
                      src={`/images/profile-picture/100x100/${member.profilePicture}`}
                      alt="avatar"
                      className="w-[60px] h-[60px] rounded-full "
                    />
                    <div className="">
                      <h1 className="text-xl">{`${member.firstName} ${member.lastName}`}</h1>
                      <span className="text-lg font-semibold">Thành viên</span>
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            })}
          </div>
        </div>
      );
  }
}

const mapStateToProps = (state) => ({
  fetchingGroupDetail: state.groups.fetchingGroupDetail,
  currentGroup: state.groups.currentGroup,
  user: state.user.data,
  members: state.groups.members,
  error: state.groups.error,
  loadingMembers: state.groups.loadingMembers,
});

export default connect(mapStateToProps)(MemberPage);
