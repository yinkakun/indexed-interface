import { ScreenHeader } from "components";
import React from "react";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function FAQ() {
  return (
    <>
      <ScreenHeader title="Frequently Asked Questions" />
      <ReactMarkdown>{(data as any).faq}</ReactMarkdown>
    </>
  );
}
