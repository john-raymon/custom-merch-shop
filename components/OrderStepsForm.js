import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { fabric } from 'fabric'
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'; // TODO: fork and modify the default values for the fabric objects, allow passing in object options to on__ functions
import invert from 'invert-color';
import { Navigation, Button } from 'lite-react-ui';
import { v4 as uuidv4 } from 'uuid';

/**
 * This component should receive the string for the area that's going to be designed and also the dimensions
 * to design on. It should handle rendering sections dynamically for the given values. 
 */
function DesignEditor(props) {
  const router = useRouter();
  const { selectedObjects, editor, onReady:_onReady } = useFabricJSEditor();
  const [ currentMode, setCurrentMode ] = useState('move');
  const [ sidebarSettings, setSidebarSettings] = useState({ text: false });
  const invertedColor = invert(props.productColor.background);
  const [textColor, setTextColor] = useState(invertedColor);
  const [textFontFamily, setTextFontFamily] = useState('Questrial');
  const [textFontStyle, setTextFontStyle] = useState('normal');
  const allPixelFontSizes = [
    '6',  '7',  '8',  '9',
    '10', '11', '12', '14',
    '16', '18', '21', '24',
    '30', '36', '48', '60',
    '72'
  ];
  const [textPixelFontSize, setTextPixelFontSize] = useState(allPixelFontSizes[0]);
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    if (selectedObjects.length && selectedObjects[0].type === 'textbox') {
      const textObject = selectedObjects[0];
      setTextColor(textObject.get('fill'));
      setTextFontFamily(textObject.get('fontFamily'));
      setTextFontStyle(textObject.get('fontStyle'));
      setTextPixelFontSize(textObject.get('fontSize'));
      setSidebarSettings({ text: true });
    } else {
      setSidebarSettings({ text: false });
    }
    
  }, [selectedObjects]);

  useEffect(() => {
    // watch for changes to the text settings related state values
    // then only apply changes to the selectedObject if it's a textbox type of fabric object
    // todo: iterate through all selectedObjects and apply to all textbox types the text settings
    if (selectedObjects.length && selectedObjects[0].type === 'textbox') { 
      const selectedTextObject = selectedObjects[0];
      selectedTextObject.set({
        fill: textColor,
        fontFamily: textFontFamily,
        fontStyle: textFontStyle,
        fontSize: textPixelFontSize
      });
      canvas.renderAll()
    }
  }, [textFontFamily, textFontStyle, textColor, textPixelFontSize]);

  useEffect(() => {
    const handleMouseDown = (options) => {
      editor.canvas.on('mouse:up', function () {
        editor.canvas.off('mouse:down', handleMouseDown);
      });
      if (currentMode === 'text') {
        const { x:left, y:top } = editor.canvas.getPointer(options.e);
        const object = new fabric.Textbox("Text", {
          fill: textColor,
          fontFamily: textFontFamily,
          fontStyle: textFontStyle,
          fontSize: textPixelFontSize,
          left,
          top
        })
        const uniqueObjectId = uuidv4();
        object.id = uniqueObjectId;
        editor.canvas.add(object);
        canvas.setActiveObject(object);
        editor.canvas.defaultCursor = 'default';
        setCurrentMode('move'); // explicitly revert back to move cursor when done
      }
    }
    const handleMouseWheel = opt => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    }
    editor?.canvas.on('mouse:wheel', handleMouseWheel);
    editor?.canvas.on('mouse:down', handleMouseDown);
    return () => {
      editor?.canvas.off('mouse:down', handleMouseDown);
      editor?.canvas.off('mouse:wheel', handleMouseWheel);
    }
  }, [currentMode, canvas]);

  function onReady(canvas) {
    // canvas.on('mouse:down', handleMouseDown);
    fabric.DPI = 700;
    setCanvas(canvas);
    _onReady(canvas);
  };

  const [pngUrl, setPngUrl] = useState(null);
  function handleDownload(e) {
    e.preventDefault();
    const originWidth = canvas.getWidth();

    function zoom (width)
        {
          const scale = width / canvas.getWidth();
          const height = scale * canvas.getHeight();

          canvas.setDimensions({
              "width": width,
              "height": height
          });

          canvas.calcOffset();
          const objects = canvas.getObjects();
          for (let i in objects) {
              const scaleX = objects[i].scaleX;
              const scaleY = objects[i].scaleY;
              const left = objects[i].left;
              const top = objects[i].top;

              objects[i].scaleX = scaleX * scale;
              objects[i].scaleY = scaleY * scale;
              objects[i].left = left * scale;
              objects[i].top = top * scale;

              objects[i].setCoords();
          }
          canvas.renderAll();
    }

    zoom (10000);

    const imageData = canvas.toDataURL({
            format: 'png',
            quality: 1
        });
    setPngUrl(imageData)
    zoom (originWidth);
  }

  function handleSettingChange(e) {
    if (e.target.name === 'font-family') {
      setTextFontFamily(e.target.value);
    }
    if (e.target.name === 'font-style') {
      setTextFontStyle(e.target.value);  
    }
    if (e.target.name === 'font-size') {
      setTextPixelFontSize(e.target.value);
    }
  }

  /**
   * TODO: provide percentage values for the height, width, left, top percentages associated
   * with a blank product image, so that it's inner canvas container frame is placed
   * in the correct position. 
   */
  return (
    <div className='w-full h-full fixed top-0 left-0 bg-white bg-opacity overflow-scroll'>
      <div className="w-full mt-10 px-24 mb-10">
        <div className="w-full flex justify-between my-4">
          <button onClick={(e) => { e.preventDefault(); router.back(); }} className="text-left text-gray-800 font-quest capitalize underline">
            back
          </button>
          <p className="font-quest text-lg text-gray-800 mx-auto text-center py-4">
          Use the tools below to customize your product.
          </p>
          <button onClick={handleDownload} className="text-right text-gray-800 font-quest capitalize underline ">
                      create png
                    </button>
          { pngUrl ? (<img src={pngUrl} width="10" />): ''}

        </div>
        <div className="flex flex-row space-x-8 w-full">
          <div className="flex flex-1 w-4/12">
            <div className="w-full bg-white shadow-2xl rounded-lg p-2 h-96">

            </div>
          </div>
          <div className="flex w-5/12 flex-col">
            <Navigation className="mb-4 p-0" navLinks={[
              {
                onClick: (e) => {
                  e.preventDefault();
                  editor.canvas.defaultCursor = 'default';
                  setCurrentMode('move');
                },
                active: currentMode === 'move',
                render(props) {
                  return ( 
                    <Button buttonType="secondary" {...{...props, className: `${props.className} cursor-pointer px-2`}}>
                      <div className="w-6 h-6 cursor-pointer">
                        <svg viewBox='0 0 512 512' width="100%" height="100%">
                          <title>Move</title><path fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='32' d='M176 112l80-80 80 80M255.98 32l.02 448M176 400l80 80 80-80M400 176l80 80-80 80M112 176l-80 80 80 80M32 256h448'/>
                        </svg>
                      </div>
                    </Button>
                  )
                }
              }, 
              {
                active: currentMode === 'text',
                onClick(e) {
                  e.preventDefault();
                  editor.canvas.defaultCursor = 'crosshair';
                  setCurrentMode('text');
                },
                render(props) {
                  return ( 
                    <Button buttonType="secondary" onClick={props.onClick} active={props.active} className={`${props.className} cursor-pointer px-2`}>
                      <div className="w-6 h-6 cursor-pointer">
                        <svg xmlns='http://www.w3.org/2000/svg' className='ionicon' viewBox='0 0 512 512'><title>Text</title><path fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='32' d='M32 415.5l120-320 120 320M230 303.5H74M326 239.5c12.19-28.69 41-48 74-48h0c46 0 80 32 80 80v144'/><path d='M320 358.5c0 36 26.86 58 60 58 54 0 100-27 100-106v-15c-20 0-58 1-92 5-32.77 3.86-68 19-68 58z' fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='32'/></svg>
                      </div>
                    </Button>
                  )
                }
              }]} />
            <div className="w-full bg-white shadow-2xl rounded-lg p-2">
              <div className="w-full overflow-hidden rounded-3xl px-10">
                <div className="aspect-w-1 aspect-h-1 relative" href='/2/design-editor/short-sleeve-back'>
                  <div style={props.productColor} className="w-full">
                    <img src={props.productImage} className="w-full" />
                  </div>
                  <div className="inner-canvas-frame" style={{ borderColor: invertedColor}}>
                    <FabricJSCanvas className="h-full cursor-crosshair" onReady={onReady} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-3/12">
            <div className="w-full bg-white shadow-2xl rounded-lg p-8">
              { 
                sidebarSettings.text ?
                  <div>
                    <p className="font-quest text-sm tracking-wide font-extrabold p-3">Text</p>
                    <div className="flex w-full flex-wrap space-y-1">
                      <select value={textFontFamily} onChange={handleSettingChange} className="w-full text-gray-700 text-sm appearance-none p-3 outline-none" name="font-family">
                        <option value="arial">
                          Arial
                        </option>
                        <option value="Questrial">
                          Questrial
                        </option>
                      </select>
                      <select value={textFontStyle} onChange={handleSettingChange} className="w-1/2 text-gray-700 text-sm appearance-none p-3 outline-none" name="font-style">
                        <option value="normal">
                          Normal
                        </option>
                        <option value="italic">
                          Italic
                        </option>
                      </select>
                      <select value={textPixelFontSize} onChange={handleSettingChange} className="w-1/2 text-gray-700 text-sm appearance-none p-3 outline-none" name="font-size">
                        {
                          allPixelFontSizes.map((size) => {
                            return (
                              <option key={size} value={size}>
                                {size} px
                              </option>
                            )
                          })
                        }
                      </select>
                    </div>
                  </div>
                :
                ''
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}  

function StepTwo(props) {
  const backgroundStyles = {
    background: props.productColor || '#000000',
  };
  const productFileNames = {
    'short-sleeve-front': '/short-sleeve-front.png',
    'short-sleeve-back': '/short-sleeve-back.png',
    'short-sleeve-right-sleeve': '/short-sleeve-right-sleeve.png',
    'short-sleeve-left-sleeve': '/short-sleeve-left-sleeve.png'
  }
  const [showDesignEditor, setShowDesignEditor] = useState(false);
  const router = useRouter();

  return (
    <div className="w-full h-full">
      <div className="flex py-10">
        <div className="flex h-full w-1/2">
          <p className="w-3/4 font-quest text-6xl text-left">
            Select an area to design.
          </p>
        </div>
        <div className="w-1/2 h-full">
          <div className="w-full flex flex-wrap justify-end space-y-8 space-x-5">
              <div className="w-full flex justify-end cursor-pointer">
                <div className="w-1/2 overflow-hidden rounded-3xl shadow-2xl clear-right">
                  <Link href="/2/design-editor/short-sleeve-front" className="aspect-w-1 aspect-h-1"> 
                    <div style={backgroundStyles}>
                      <img src="/short-sleeve-front.png" className="w-full" />
                    </div>
                  </Link>
                </div>
              </div>
              <div className="w-1/5 overflow-hidden rounded-3xl shadow-2xl cursor-pointer">
                <Link className="aspect-w-1 aspect-h-1" href='/2/design-editor/short-sleeve-back'>
                  <div style={backgroundStyles} >
                    <img src="/short-sleeve-back.png" className="w-full" />
                  </div>
                </Link>
              </div>
              <div className="w-1/5 overflow-hidden rounded-3xl shadow-2xl cursor-pointer">
                <Link className="aspect-w-1 aspect-h-1" href="/2/design-editor/short-sleeve-right-sleeve">
                  <div style={backgroundStyles}>
                    <img src="/short-sleeve-right-sleeve.png" className="w-full" />
                  </div>
                </Link>
              </div>
              <div className="w-1/5 overflow-hidden rounded-3xl shadow-2xl cursor-pointer">
                <Link className="aspect-w-1 aspect-h-1" href="/2/design-editor/short-sleeve-left-sleeve"> 
                  <div style={backgroundStyles}>
                    <img src="/short-sleeve-left-sleeve.png" className="w-full" />
                  </div>
                </Link>
              </div>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-between space-x-1">
          <button onClick={props.prevStep} className="disabled:opacity-50 w-full md:w-2/5 font-quest text-white text-md bg-black p-4 self-end my-1 outline-none">
            Prev
          </button>
          <button className="disabled:opacity-50 w-full md:w-2/5 font-quest text-white text-md bg-black p-4 self-end my-1 outline-none">
            Next
          </button>
      </div>

      {
        router.query.params[1] === 'design-editor' && <DesignEditor productColor={backgroundStyles} productImage={productFileNames[router.query.params[2]]} />
      }
    </div>
  )
}

function StepOne(props) {
  const [selectedProduct, setProduct] = useState("");
  const [selectedProductVariant, _setSelectedProductVariant] = useState(null);
  const [productObject, setProductObject] = useState(null);
  const [productsById, updateProducts] = useState({ ...props.productsById });
  const setSelectedProductVariant = (productVariant) => {
    _setSelectedProductVariant(productVariant)
    if (productVariant === null) {
      setProductObject(null);
    } else {
      setProductObject(productsById[selectedProduct]) //selectedProduct shouldve really an object in the first place;
    }
  }
  useEffect(() => {
    handleProductChange(null, 5);
    if (props.productVariant) {
      handleProductChange(null, props.productVariant.product_id);
    }
  }, [])
  useEffect(() => {
    // this handles, reselecting the last selected product variant's product, color, and size when returning back to this step.
    // this may have been better https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
    if (props.productVariant && props.productVariant.product_id === selectedProduct && productsById[selectedProduct].variants && (!productsById[selectedProduct].lastSelectedSize && !productsById[selectedProduct].lastSelectedColor)) {
      const color = props.productVariant.color;
      const size = props.productVariant.size;
      updateProducts({ ...productsById, [selectedProduct]: {...productsById[selectedProduct], lastSelectedColor: color, lastSelectedSize: size }})
      setSelectedProductVariant(props.productVariant);
    }
  }, [productsById])
  const handleProductChange = (e = null, productId) => {
    const id = e ? e.target.value : productId;
    setProduct(id);
    fetchProductsVariants(id);
  }
  // fetchProductsVariants has to fetch the color and size variants for the given product id
  async function fetchProductsVariants(productId) {
    if (selectedProductVariant) {
      setSelectedProductVariant(null);
    }
    if (productsById[productId].variants) {
      const color = productsById[productId].lastSelectedColor;
      const size = productsById[productId].lastSelectedSize;
      if (color && size) {
        setSelectedProductVariant(productsById[productId].variants[color][size]);
      }
      return;
    }
    const res = await fetch(`api/products/${productId}`);
    const data = await res.json();
    updateProducts({ ...productsById, [productId]: {...productsById[productId], variants: data.variants }})
  };
  function handleLastSelectedColorChange(productId, color) {
    // reset selected product variant since a change of product color resets the last selected size too
    // hence invalidaing the last set selectedProductVariant object
    setSelectedProductVariant(null);
    // reset last selected size, since there are different sizes for each color
    updateProducts({ ...productsById, [productId]: {...productsById[productId], lastSelectedColor: color, lastSelectedSize: '' }})
  }
  function handleLastSelectedSizeChange(productId, color, size) {
    setSelectedProductVariant(productsById[productId].variants[color][size]);
    updateProducts({
      ...productsById,
      [productId]: {
        ...productsById[productId], 
        lastSelectedSize: size,
      },
    })
  };
  function validateThenSubmitNext(e) {
    e.preventDefault();
    // valid if there is a selectedProductVariant object
    if (selectedProductVariant) {
      props.handleNextSubmit(selectedProductVariant, productObject);
    }
  }
  return (
    <div className="flex w-full h-full">
      <div className="flex h-full w-1/2">
        <p className="w-3/4 font-quest text-6xl text-left">
          Choose a product to design
        </p>
      </div>
      <div className="flex flex-col w-1/2">
        <ul className="space-y-6 w-full overflow-y-scroll h-96">
          {
            Object.values(productsById).map((product) => {
              const key = product.id + product.variant_count;
              const isProductSelected = parseInt(selectedProduct) === parseInt(product.id);
              return (
                <li key={key} tabIndex="1" className="outline-none">
                  <div className="flex flex-row space-x-6 border-b">
                    <div className="self-center pl-1">
                      <input className="cursor-pointer" name="product-type" value={product.id} type="radio" onChange={handleProductChange} checked={isProductSelected} tabIndex="1"/>
                      {/* <label for="huey">s</label> */}
                    </div>
                    <div className="flex flex-grow justify-between items-center">
                      <p className="font-quest text-xl pr-4 text-left">{product.model}</p>
                      <img src={product.image} className="object-cover h-24 w-1/3 rounded-tl-md rounded-tr-md" />
                    </div>
                  </div>
                  { 
                    (isProductSelected && productsById[product.id].variants) ?
                    <div className="w-full space-y-2 my-3">
                      <div className="w-full flex flex-row items-center space-x-3">
                        <p className="font-quest text-base">
                          Choose a color for your item.
                        </p>
                        <ul className="flex flex-row space-x-2">
                          {
                          Object.keys(product.variants).map((color) => {
                            return (
                              <li key={color} className="w-7 h-7 relative">
                                <div className="w-full h-full rounded-full pointer" style={{ background: Object.values(product.variants[color])[0].color_code }} />
                                <input 
                                  className="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer" 
                                  type="radio" 
                                  name="variant-color-selected" 
                                  value={color} 
                                  onChange={() => handleLastSelectedColorChange(product.id, color)}
                                  tabIndex="1"
                                />  
                              </li>
                            )
                          })
                          }
                        </ul>
                      </div>
                      <div className="w-full flex flex-row items-center space-x-3">
                        <p className="font-quest text-base">
                          Choose a size for your item.
                        </p>
                        <ul className="flex flex-row space-x-2">
                          <select className="text-gray-700 font-quest text-base" value={productsById[product.id].lastSelectedSize || ''} onChange={(e) => handleLastSelectedSizeChange(product.id, productsById[product.id].lastSelectedColor, e.target.value)}>
                              <option value="" disabled>{ !productsById[product.id].lastSelectedColor ? 'Select a color above first' : 'Select a size'}</option>
                              {
                                Object.keys(productsById[product.id].lastSelectedColor ? productsById[product.id].variants[productsById[product.id].lastSelectedColor] : []).map((size) => {
                                  return (
                                    <option value={size} key={size}>{size}</option>
                                  )
                                })
                              }
                          </select>
                        </ul>
                      </div>
                    </div>
                    : ''
                  }
                </li>
              );
            })
          }
        </ul>
        <button onClick={validateThenSubmitNext} disabled={selectedProductVariant ? false : true} className="disabled:opacity-50 w-full md:w-2/5 font-quest text-white text-md bg-black p-4 self-end my-16 outline-none">
          Start designing your item
        </button>
      </div>
    </div>
  );
}

export default function OrderStepForm(props) { 
  const [productVariant, setProductVariant] = useState(null);
  const [productObject, setProductObject] = useState(null);
  const router = useRouter();
  useEffect(() => {
    if (props.currentStep > 1 && !productVariant) {
      router.push('/1'); 
      // todo: store step data in local
      // storage and rehydrate state with it, if state from previous components are missing
    }
  })

  // go to previous step
  function prevStep(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (props.currentStep > 1) {
      router.push(`/${props.currentStep - 1}`)
      // setSteps({ ...steps, currentStep: props.currentStep - 1});
    }
  }
  // for last step instead of calling nextStep call submitForm method
  function nextStep() {
    if (props.currentStep < 3) {
      router.push(`/${props.currentStep + 1}`)
      // setSteps({...steps, currentStep: props.currentStep + 1})
    }
  }

  function renderSwitchSteps(step) {
    switch (parseInt(step)) {
      case 1:
        return (<StepOne productsById={props.productsById} handleNextSubmit={(productVariant, productObject) => { setProductVariant(productVariant); setProductObject(productObject); nextStep(); }} productVariant={productVariant} productObject={productObject} />);
        break;
      case 2:
        return (<StepTwo prevStep={prevStep} productColor={(productVariant && productVariant.color_code) || null}></StepTwo>);
      default:
        break;
    }
  }
  return (
    <form className="w-full h-full">
      {
        renderSwitchSteps(props.currentStep)
      }
    </form>
  )
}