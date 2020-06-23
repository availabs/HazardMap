import React, { useState, useEffect } from "react"

import { Input, TextArea, ArrayInput, Select } from "components/avl-components/components/Inputs"
import Editor from "../components/editor"
import ImgInput from "../components/img-input"

import get from "lodash.get"

import { verifyValue, hasValue } from "components/avl-components/components/Inputs/utils"
import { prettyKey, hasBeenUpdated, getValue } from "../utils"

const useSetSections = format => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    setSections(format.attributes.reduce((a, c) => {
      a[a.length - 1].push(c);
      if (c.wizardBreak) {
        a.push([]);
      }
      return a;
    }, [[]]));
  }, [format])

  return sections;
}

const INITIAL = {
  numSections: 0,
  activeSection: -1,
  canGoNext: false,
  next: () => {},
  canGoPrev: false,
  prev: () => {},
  sections: []
}

const useProcessValues = (sections) => {
  const [section, setSection] = useState(0);
  const [values, setValues] = useState({});

  const Processed = JSON.parse(JSON.stringify(INITIAL)),
    [Sections, setSections] = useState([]);

  Processed.setValues = (key, value) => setValues(prev => ({ ...prev, [key]: value }))
  Processed.values = { ...values };

  useEffect(() => {
    if (!Sections.length) {
      const Sections = sections.reduce((accum, attributes, index) => {
        const Section = {
          index,
          isActive: false,
          verified: false,
          attributes: attributes.map(att => ({
            verified: false,
            ...att,
            value: undefined,
            Input: (() => {
              const [type, array] = att.type.split("-");
              switch (type) {
                case "textarea":
                  return TextArea;
                case "img":
                  return ImgInput;
                case "rich-text":
                  return Editor;
                default:
                  if (array && att.domain) {
                    return props => <Select { ...props } multi={ true }/>;
                  }
                  if (att.domain) {
                    return props => <Select { ...props } multi={ false }/>;
                  }
                  if (array) {
                    return props => <ArrayInput { ...props } type={ type }/>;
                  }
                  return props => <Input { ...props } type={ type }/>;
              }
            })()
          }))
        }
        accum.push(Section);
        return accum;
      }, [])
      setSections(Sections);
    }
  }, [Sections, sections]);
  Processed.sections = Sections;

  if (Sections.length) {
    Sections.forEach((sect, index) => {
      sect.isActive = section === index;
      sect.verified = false;
      sect.attributes.forEach(att => {
        const value = values[att.key];
        att.value = value;
        att.verified = att.required ? hasValue(value) && verifyValue(value, att.type, att.verify) : true;
      })
      sect.verified = sect.attributes.reduce((a, c) => a && c.verified, true)
    })

    Processed.activeSection = section;
    Processed.numSections = Sections.length;
    Processed.canGoNext = ((section + 1) < Sections.length) && Sections[section].verified;
    Processed.next = () => {
      if (!Sections[section].verified) return;
      if ((section + 1) === Sections.length) return;
      setSection(section + 1);
    };
    Processed.canGoPrev = section > 0;
    Processed.prev = () => {
      if (section === 0) return;
      setSection(section - 1);
    };
  }

  return Processed;
}

export const dmsCreate = Component => {
  return ({ format, ...props }) => {
    const sections = useSetSections(format);

    const Processed = useProcessValues(sections);

    const [init, setInit] = useState(false);
    if (!init) {
      const values = {},
        attributes = get(format, "attributes", []);

      let hasDefaults = false;

      attributes.forEach(att => {
        if (att.default) {
          hasDefaults = true;
          const value = getValue(att, { props });
          hasValue(value) && (values[att.key] = value);
        }
      })
      const hasData = Object.keys(values).length;
      hasData && Processed.setValues(values);
      setInit(hasDefaults ? hasData : true);
    }
    return (
      <Component format={ format } { ...props }
        values={ Processed.values } setValues={ Processed.setValues }
        sections={ Processed }/>
    )
  }
}


// export const dmsEdit = Component => {
//   return ({ format, ...props }) => {
//     const sections = useSetSections(format);
//
//     const [section, setSection] = useState(0);
//
//     const [values, setValues] = useState({});
//     const [init, setInit] = useState(false);
//
//     useEffect(() => {
//       if (!init) {
//         const item = get(props, props.type, null),
//           data = get(item, "data", null);
//         if (data) {
//           setValues(data);
//           setInit(true);
//         }
//       }
//     })
//   }
// }
