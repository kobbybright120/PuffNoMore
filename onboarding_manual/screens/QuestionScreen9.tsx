import React from "react";
import QuestionScreen1 from "./QuestionScreen1";

const QuestionScreen9: React.FC<any> = (props) => {
  return (
    <QuestionScreen1 {...props} question={props.question ?? "Question #9"} />
  );
};

export default QuestionScreen9;
