import React from 'react'
import uPlot from 'uplot'

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

let defaultData = [
  [1546300800, 1546387200],    // x-values (timestamps)
  [        35,         71],    // y-values (series 1)
  [        90,         15],    // y-values (series 2)
]

export default class AvlGraph extends React.Component {
	static defaultProps = {
	    id: makeid(5),
	    height: 300,
	    padding: 0.5
	}

	container = null;
  
	constructor(props) {
	    super(props);

	    this.state = {
	      width: 0,
	      height: props.height,
	      showHover: false,
	      hoverPos: [0, 0],
	      hoverData: {},
	      xDomain: [],
	      yDomain: [],
	      groups: [],
	      transitionTime: 0.15
	    }
	    // this.registerData = this.registerData.bind(this);
	    // this.onMouseEnter = this.onMouseEnter.bind(this);
	    // this.onMouseLeave = this.onMouseLeave.bind(this);
	    // this.onMouseMove = this.onMouseMove.bind(this);
	}
	setWidth() {
	    if (Boolean(this.container)) {
	      const width = this.container.clientWidth,
	        
	      if ((width !== this.state.width)) {
	        this.setState({ width });
	      }
	    }
	}

	updateGraph() {
		
	}

	componentDidMount() {
    	this.setSize();
  	}


  	


	render() {
		return (
	      	<div style={{width: '100%'}} ref={ comp => this.container = comp }>
	       	
      		</div>
      	)
	}

}

expor Graph