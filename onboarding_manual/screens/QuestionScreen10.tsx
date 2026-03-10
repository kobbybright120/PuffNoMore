import React from "react";
import QuestionScreen1 from "./QuestionScreen1";

const QuestionScreen10: React.FC<any> = (props) => {
  return (
    <QuestionScreen1 {...props} question={props.question ?? "Question #10"} />
  );
};

export default QuestionScreen10;
