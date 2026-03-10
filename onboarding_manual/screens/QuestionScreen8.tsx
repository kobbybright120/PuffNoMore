import React from "react";
import QuestionScreen1 from "./QuestionScreen1";

const QuestionScreen8: React.FC<any> = (props) => {
  return (
    <QuestionScreen1 {...props} question={props.question ?? "Question #8"} />
  );
};

export default QuestionScreen8;
