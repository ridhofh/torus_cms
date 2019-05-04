import React, { Component } from 'react';
import '../App.css';
import 'semantic-ui-css/semantic.min.css';
import createPicture from './CreatePicture';
import publishPicture from './PublishPicture';
import { API, graphqlOperation } from "aws-amplify";
import pictureList from '../GraphQL/QueryPictureList';

class AddPicture extends Component {
	constructor(props) {
		super(props)
		this.state = { 
			title: '',
			description: '',
			file: '',
			ext: '',
			list: [],
			item: '',
			itemProps: {},
			imagePreviewUrl: '',
		};
		this.handleChange = this.handleChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleOpen = this.handleOpen.bind(this)
	}

	//initialize select list with the results from the query
	componentDidMount() {
		let initialList = [];
		API.graphql(graphqlOperation(pictureList))
			.then(result => {
				return result.data.listPictures.items;
			}).then(data => {
			initialList = data.map((picture) => {
				return picture
			});
			this.setState({
				list: initialList,
			});
		});
	}

	//set state var for the file on change
	onChange(e) {
		e.preventDefault();
    	let reader = new FileReader();
		const file = e.target.files[0];
		reader.onloadend = () => {
			this.setState({
			  file: file,
			  imagePreviewUrl: reader.result,
			});
		  }
		if(file || this.state.item){
			reader.readAsDataURL(file)
		}
	}
	//set state vars of other form fields on change
	handleChange(event) {
		this.setState({ [event.target.name]: event.target.value })
	}

	//handler for openning items
	handleOpen(event) {
		console.log('item Id: ', this.state.item);
		var id = this.state.item;
		var siteUrl = 'http://almostcms.org';
		var section = 'gallery';
		for(let elem of this.state.list) {
			if(elem.id === id) {
				this.setState({
					title: elem.title,
					description: elem.description,
					file: elem.file,
					imagePreviewUrl: `${siteUrl}/${section}/${elem.file}`,
					itemProps: {
						title: elem.title,
						description: elem.description,
					}
				})	
				
			}
		}
		event.preventDefault() 
	}

	//handler for submitting items
	handleSubmit(event) {
		const file = this.state.file;
		var state = this.state;
		var props = this.state.itemProps;
    	const file_str = file.name;
   	 	const ext = file_str.split('.')[1];
		var input = {
			title: this.state.title,
			description: this.state.description,
			file: `${this.state.title}.${ext}`,
		};
		(async function(input, file, ext, state, props){
			if (state.title === props.title && state.description === props.description && state.file.name === props.file_origin) {
				alert('Error. No changes detected');
			}
			else {
				let x = await createPicture(input, file, ext).then(response => {
					return 'Success';
				});
				return x;
			}
		})(input, file, ext, state, props).then( response => {
			//console.log(response)
			switch(response) {
				case 'Success':
					this.setState({
						ext: ext,
						itemProps: {
							title: this.state.title,
							description: this.state.description,
							file: `${this.state.title}.${ext}`,
							file_origin: this.state.file.name
						},
					});
					break;
				default:
					//Do Nothing
			}
		});
		event.preventDefault()    
	}
	//handler for publish event
	handleAlternate(event) { 
		const section = 'gallery';
		var ext = this.state.ext;
		var file = `${this.state.title}.${ext}`;
		const bucketVars = {
			sourceRoute: `public/${section}`,
			sourceObject: file,
			destRoute: section,
		};
		if (this.state.title === this.state.itemProps.title && this.state.description === this.state.itemProps.description && this.state.file.name === this.state.itemProps.file_origin) {
			publishPicture(bucketVars);
		}
		else {
			alert('Error. Please Save your changes before publishing');
		}
		event.preventDefault();
	}
	  
	render() {
		let {imagePreviewUrl} = this.state;
		let $imagePreview = null;
		let list = this.state.list;
		let optionItems = list.map((picture, i) =>
			<option key={i+1} value={picture.id}>{picture.title}</option>
		);
		if (imagePreviewUrl) {
			$imagePreview = (<img src={imagePreviewUrl} alt={this.state.description}/>);
		} 
		else {
			$imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
		}
		return (
			<div>
				<div className="container section">
				<h1>Open a Picture</h1>
					<form onSubmit={this.handleOpen}>
						<select value={this.state.item} onChange={(e) => this.setState({item: e.target.value})}>
							<option key={0} value=''>Select an option</option>
							{optionItems}
						</select>
						<input disabled={!this.state.item} type="submit" value="Open"></input>
					</form>
					<h1>Post an Image</h1>
					<form onSubmit={this.handleSubmit.bind(this)}>
						<input
							name="title"
							placeholder="title"
							required="required"
							type="text"
							value={this.state.title}
							onChange={this.handleChange}
						/>
						<input
							name="description"
							placeholder="description"
							type="text"
							value={this.state.description}
							onChange={this.handleChange}
						/>
						<input
							name="file" 
							placeholder="file"
							required="required"
							type="file" 
							accept='image/'
							onChange={(e) => this.onChange(e)}
						/>
						<input type="submit" value="Save" />
						<button disabled={!this.state.ext} onClick={this.handleAlternate.bind(this)}>Publish</button>
					</form>
					<div className="imgPreview">
						{$imagePreview}
					</div>
				</div>
			</div>
		)
	}
}  
export default AddPicture;