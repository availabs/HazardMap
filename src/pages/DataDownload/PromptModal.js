import React, { Component } from 'react';
import { connect } from 'react-redux';


class PromptModal extends Component {
    constructor(props){
        super(props)
        this.state = {
        }

    }

    render () {
        return (
            <div>
                <button
                    className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white px-2 border border-blue-500 hover:border-transparent rounded-full"
                    onClick={
                        (e) => {
                            e.preventDefault()
                            document.getElementById('closeMe'+this.props.id).style.display =
                            document.getElementById('closeMe'+this.props.id).style.display === 'block' ? 'none' : 'block'}
                    }
                >
                    ?
                </button>
                <div className="fixed z-10 inset-0 overflow-y-auto"
                id={`closeMe`+this.props.id}
                tabIndex="0"
                style={{display:'none',margin: '0vh 0vw'}}
                onClick={(e) => {
                if (e.target.id === `closeMe`+this.props.id){
                    e.target.closest(`#closeMe`+this.props.id).style.display = 'none'
                }
            }}
                >
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                        <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                            <button type="button"
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                                    onClick={(e) => {
                                        e.target.closest('#closeMe' + this.props.id).style.display = 'none'
                                    }}
                                    aria-label="Close">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="sm:flex sm:items-start">
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                    Geolevel
                                </h3>
                                <div class="mt-2">
                                    <p class="text-sm leading-5 text-gray-500">
                                        {this.props.prompt}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>


        )
    }
}

const mapDispatchToProps = {

};

const mapStateToProps = state => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PromptModal)
