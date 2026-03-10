import React from "react";
import QuestionScreen1 from "./QuestionScreen1";

const QuestionScreen7: React.FC<any> = (props) => {
  return (
    <QuestionScreen1 {...props} question={props.question ?? "Question #7"} />
  );
};

export default QuestionScreen7;
