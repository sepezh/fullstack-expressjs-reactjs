import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import * as uuid from "uuid";
import { ConnectedUsernameDisplay } from "./UsernameDisplay";
import {
  setTaskCompletion,
  addTaskComment,
  setTaskGroup,
  setTaskName,
} from "../store/mutations";

const TaskDetail = ({
  id,
  comments,
  task,
  isOwner,
  isComplete,
  sessionID,
  groups,
  setTaskCompletion,
  addTaskComment,
  setTaskGroup,
  setTaskName,
}) => {
  return (
    <div className="card p-3 col-6">
      {isOwner ? (
        <div>
          <input
            type="text"
            value={task.name}
            onChange={setTaskName}
            className="form-control form-control-lg"
          />
        </div>
      ) : (
        <h3>
          {task.name} {isComplete ? `✓` : null}
        </h3>
      )}

      <div className="mt-3">
        {isOwner ? (
          <div>
            <div>
              You are the owner of this task.
              <button
                className="btn btn-primary ml-2"
                onClick={() => setTaskCompletion(id, !isComplete)}
              >
                {isComplete ? `Reopen` : `Complete`} This Task
              </button>
            </div>
          </div>
        ) : (
          <div>
            <ConnectedUsernameDisplay id={task.owner} /> is the owner of this
            task.
          </div>
        )}
      </div>
      <div className="mt-2">
        {comments.map((comment) => (
          <div key={comment.id}>
            <ConnectedUsernameDisplay id={comment.owner} /> : {comment.content}
          </div>
        ))}
      </div>

      <form className="form-inline">
        <span className="mr-4">Change Group</span>
        <select onChange={setTaskGroup} className="form-control">
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </form>

      <form
        className="form-inline"
        onSubmit={(event) => addTaskComment(id, sessionID, event)}
      >
        <input
          type="text"
          name="commentContents"
          autoComplete="off"
          placeholder="Add a comment"
          className="form-control"
        />
        <button type="submit" className="btn">
          Submit
        </button>
      </form>

      <div>
        <Link to="/dashboard">
          <button className="btn btn-primary mt-2">Done</button>
        </Link>
      </div>
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  let id = ownProps.match.params.id;
  let task = state.tasks.find((task) => task.id === id);
  let comments = state.comments.filter((comment) => comment.task === id);
  let isOwner = state.session.id === task.owner;
  let groups = state.groups;

  return {
    id,
    task,
    comments,
    isOwner,
    sessionID: state.session.id,
    isComplete: task.isComplete,
    groups,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let id = ownProps.match.params.id;
  return {
    setTaskCompletion(id, isComplete) {
      dispatch(setTaskCompletion(id, isComplete));
    },
    setTaskGroup(event) {
      dispatch(setTaskGroup(id, event.target.value));
    },
    setTaskName(event) {
      dispatch(setTaskName(id, event.target.value));
    },
    addTaskComment(taskID, ownerID, event) {
      let input = event.target[`commentContents`];
      let commentID = uuid();
      let content = input.value;
      event.preventDefault();
      if (content !== ``) {
        input.value = ``;
        dispatch(addTaskComment(commentID, taskID, ownerID, content));
      }
    },
  };
}

export const ConnectTaskDetail = connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskDetail);
