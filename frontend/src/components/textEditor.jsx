import React, { useState, useEffect } from 'react';
import Quill from 'quill';

const TextEditor = ({ handleChange, id, defaultValue, className }) => {
  const actualId = id || "editor";
  const actualClassName = className || "date-picker";

  useEffect(() => {
      const quill = new Quill("#editor-"+actualId, {
        theme: 'snow'
      });

      quill.setContents(defaultValue);

      quill.on('editor-change', (eventName, ...args) => {
            const delta = quill.getContents();
            handleChange(delta);
        });
  }, []);

  return (
      <div id={actualId} className={actualClassName}>
          <link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet"/>
          <div id={"editor-"+actualId}></div>
      </div>
  );
};

export default TextEditor;