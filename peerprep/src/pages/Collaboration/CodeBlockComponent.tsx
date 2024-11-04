import './CodeBlockComponent.scss';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { NodeViewProps } from '@tiptap/core';

// Interface for extension options
interface CodeBlockExtensionOptions {
  lowlight: {
    listLanguages: () => string[];
  };
}

const CodeBlockComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  extension,
}) => {
  const defaultLanguage = node.attrs.language as string;

  // Assert the type of `extension.options` to match `CodeBlockExtensionOptions`
  const options = extension.options as CodeBlockExtensionOptions;

  return (
    <NodeViewWrapper className="code-block">
      <select
        contentEditable={false}
        defaultValue={defaultLanguage}
        onChange={(event) => updateAttributes({ language: event.target.value })}
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {options.lowlight.listLanguages().map((lang: string, index: number) => (
          <option key={index} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
