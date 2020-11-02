import React from "react"

 import { Button } from "components/avl-components/components/Button"
// import { ValueContainer, ValueItem } from "components/avl-components/components/Inputs/parts"
import { verifyValue as utilityVerify, hasValue as defaultHasValue } from "components/avl-components/components/Inputs/utils"
//import { useSetRefs } from "components/avl-components/components/utils"
import SectionView from './SectionView'
import SectionEdit from './SectionEdit'


const DefaultDisplay = ({ value }) => {
  switch (typeof value) {
    case "object":
      return JSON.stringify(value, null, 3);
    default:
      return value.toString();
  }
};
const defaultGetEmptyValue = () => null;

export default React.forwardRef(({ Input, onChange, value, disabled, autoFocus,
  DisplayComp = DefaultDisplay, inputProps, type, verify,
  verifyValue, hasValue = defaultHasValue,
  getEmptyValue = defaultGetEmptyValue, ...props }, ref) => {

  //console.log('value',props.Attribute, value)
  value = value || [];

  const [node] = React.useState(null),
    [newItem, setNewItem] = React.useState(getEmptyValue),
    [editIndex, setEditIndex] = React.useState(null),
    [addItem, setAddItem] = React.useState(false),

    addToArray = React.useCallback(e => {
      console.log('addToArray', editIndex)
      const newValue = editIndex === null ? 
        [...value, newItem] :
        Object.assign([], value, {[editIndex]: newItem});

      onChange(newValue);
      setNewItem(getEmptyValue());
      setEditIndex(null)
      setAddItem(false)
      node && node.focus();
    }, [value, newItem, node, onChange, getEmptyValue, editIndex]),

    removeFromArray = React.useCallback(v => {
      onChange(value.filter(vv => vv !== v));
    }, [value, onChange]),

    addNewItem = React.useCallback(e => {
      setAddItem(!addItem)
      setNewItem(getEmptyValue())
    }, [addItem,getEmptyValue]),

    editItem = React.useCallback((v,i) => {
      setEditIndex(i);
      setNewItem(v);
      node && node.focus();
    }, [node]),

    buttonDisabled = React.useMemo(() =>
      disabled ||
      !hasValue(newItem) ||
      value.includes(newItem) ||
      !(verifyValue ? verifyValue(newItem) : utilityVerify(newItem, type, verify)) ||
      ((type === "number") && !value.reduce((a, c) => a && (+c !== +newItem), true))
    , [value, newItem, hasValue, verifyValue, verify, type, disabled]),

    onKeyDown = React.useCallback(e => {
      if (!buttonDisabled && e.keyCode === 13) {
        e.stopPropagation();
        e.preventDefault();
        addToArray();
      }
    }, [addToArray, buttonDisabled]);

  

  return (
    <div className="w-full">
      <div className="flex flex-col px-4 sm:px-6 lg:px-12">
        <div>
          <Button onClick={addNewItem} >
            {addItem ? 'Cancel' : 'Add Section'}
          </Button>
        </div>
        {addItem ? 
          <SectionEdit
            value={ newItem } 
            onChange={ setNewItem } 
            disabled={ disabled } 
            autoFocus={ autoFocus } 
            onKeyDown={ onKeyDown }
            placeholder={ `Type a value...`} 
            addToArray={ addToArray } 
            buttonDisabled={ buttonDisabled }
            { ...props } { ...inputProps }
          /> : ''
          }
      </div>
      { !value.length ? null :
          value.map((v, i) => {
            return editIndex === i ? 
              <SectionEdit
                key={i}
                value={ newItem } 
                onChange={ setNewItem } 
                disabled={ disabled } 
                autoFocus={ autoFocus } 
                onKeyDown={ onKeyDown }
                placeholder={ `Type a value...`} 
                addToArray={ addToArray } 
                buttonDisabled={ buttonDisabled }
                { ...props } { ...inputProps }
              /> : 
              <SectionView 
                key={i} 
                value={v}  
                edit={ e => editItem(v,i) }
                remove={ e => removeFromArray(v) }
              />
          })
      }
    </div>
  )
})
