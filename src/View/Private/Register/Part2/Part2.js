import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import axios from 'axios';
import { connect } from "react-redux";
import Dropzone from 'react-dropzone';
import { v4 as randomString } from 'uuid';
import { PacmanLoader } from 'react-spinners';

// Material-ui
import {
    RadioGroup,
    Radio,
    FormControlLabel,
    FormControl,
    FormLabel,
    withStyles,
    IconButton,
    Select,
    MenuItem,
    FormHelperText,
    Grid,
    Button,
    Paper,
    Typography,
    TextField,
    Input
} from '@material-ui/core';

// import { PhotoCamera } from '@material-ui/icons'
import PhotoCamera from '@material-ui/icons/PhotoCamera';



import {
    updateUser,
    updateNestedObject
} from "../../../../Ducks/registration";

import './Part2.css';

const styles = theme => ({
    root: {
        display: 'flex',
    },
    formControl: {
        margin: theme.spacing.unit * 3,
    },
    group: {
        margin: `${theme.spacing.unit}px 0`,
    },
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: "80%",
    },
    input: {
        margin: theme.spacing.unit,
        width: "80%",
    },
})

class Part2 extends Component {
    constructor() {
        super()
        this.state = {
            files: [],
            isUploading: false,
            images: [],
            url: 'http://via.placeholder.com/450x450',
            value: '',
            size: 'xs'
        }
    }

    componentDidMount() {
        if (!this.props.user.user_id) {
            axios.get('/api/user-data')
                .then(resp => {
                    this.props.updateUser(resp.data)
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }


    // // // PHOTO UPLOADING // // //

    onDrop(files) {
        this.setState({
            files
        });
    }

    uploadFile = (file, signedRequest, url) => {

        var options = {
            headers: {
                'Content-Type': file.type
            }
        };

        axios.put(signedRequest, file, options)
            .then(response => {
                this.setState({ isUploading: false, url: url })
                // THEN DO SOMETHING WITH THE URL. SEND TO DB USING POST REQUEST OR SOMETHING
                this.handleUpdate({ what: 'photo', val: url })
            })
            .catch(err => {
                this.setState({
                    isUploading: false
                })
                if (err.response.status === 403) {
                    alert('Your request for a signed URL failed with a status 403. Double check the CORS configuration and bucket policy in the README. You also will want to double check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env and ensure that they are the same as the ones that you created in the IAM dashboard. You may need to generate new keys\n' + err.stack)
                } else {
                    alert(`ERROR: ${err.status}\n ${err.stack}`)
                }
            })
    }


    getSignedRequest = ([file]) => {
        this.setState({ isUploading: true })

        const fileName = `${randomString()}-${file.name.replace(/\s/g, '-')}`

        axios.get('/sign-s3', {
            params: {
                'file-name': fileName,
                'file-type': file.type
            }
        }).then((response) => {
            const { signedRequest, url } = response.data
            this.uploadFile(file, signedRequest, url)
        }).catch(err => {
            console.log(err)
        })
    }




    // // // UPDATE REDUX // // //
    handleUpdate = (updateObj) => {
        if (updateObj.val.length < 1000 || typeof updateObj.val !== 'string') {
            let newUpdateObj = { ...updateObj, where: 'participant', }
            this.props.updateNestedObject(newUpdateObj);
        }
    }

    handleSize = event => {
        this.handleUpdate({ what: 'size', val: event.target.value })
    }

    handleOrderBooks = event => {
        this.handleUpdate({ what: 'order_books', val: event.target.value })
    }

    render() {
        const {
            user,
            camper: {
                health_card_num,
                dietary_concerns,
                medical_concerns,
                comments,
                photo,
                size,
                order_books
            },
            classes
        } = this.props

        return (
            <div>
                {user.user_id ? (

                    <div>
                        <Paper className="top">
                            <h1>More Details</h1>
                        </Paper>
                        <Grid
                            container
                            spacing={8}
                            direction='column'
                            justify="center"
                            alignItems='center'
                            alignContent='center'
                        >

                            <Grid item xs={12}>
                                <Paper>

                                    <h2>A Few More Things</h2>
                                    <h3>Upload a Photo</h3>
                                    <div className="photoUploader">
                                        {/* This is where React S3 Uploader */}
                                        <div className="dropzone">
                                            {/* <Dropzone onDrop={this.onDrop.bind(this)}>
                                            <p>Try dropping some files here, or click to select files to upload.</p>
                                        </Dropzone> */}
                                            <Dropzone
                                                onDropAccepted={this.getSignedRequest}
                                                style={{
                                                    position: 'relative',
                                                    width: 200,
                                                    height: 200,
                                                    borderWidth: 7,
                                                    marginTop: 100,
                                                    borderColor: 'rgb(102, 102, 102)',
                                                    borderStyle: 'dashed',
                                                    borderRadius: 5,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    fontSize: 28,
                                                }}
                                                accept='image/*'
                                                multiple={false} >

                                                {this.state.isUploading
                                                    ? <PacmanLoader />
                                                    // : (
                                                    //     <IconButton color="primary" className={classes.button} component="span">
                                                    //         <PhotoCamera />
                                                    //     </IconButton>
                                                    // )
                                                    : <p>Drop File or Click Here</p>
                                                }
                                            </Dropzone>

                                            {/* <input
                                        accept="image/*"
                                        className={classes.input}
                                        id="icon-button-file"
                                        type="file"
                                        onChange={(e) => this.getSignedRequest([e.target.value])}
                                        />
                                        <label htmlFor="icon-button-file">
                                        <IconButton color="primary" className={classes.button} component="span">
                                        <PhotoCamera />
                                        </IconButton>
                                    </label> */}
                                        </div>
                                        <img src={photo} className='confirm-photo' />
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper className={classes.root}>
                                    <FormControl className={classes.formControl}>
                                        <Select
                                            aria-label="T-Shirt Size"
                                            name="t-shirt size"
                                            displayEmpty
                                            className={classes.selectEmpty}
                                            value={size}
                                            onChange={this.handleSize}
                                        >
                                            <MenuItem value="" disabled>
                                                T-Shirt Size
                                        </MenuItem>
                                            <MenuItem value="xl">Extra Large</MenuItem>
                                            <MenuItem value="l">Large</MenuItem>
                                            <MenuItem value="m">Medium</MenuItem>
                                            <MenuItem value='s'>Small</MenuItem>
                                            <MenuItem value='xs'>Extra Small</MenuItem>
                                        </Select>
                                        <FormHelperText>T-Shirt Size</FormHelperText>
                                    </FormControl>

                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper>
                                    <FormControl className={classes.formControl}>
                                        <Select
                                            aria-label="Order Books Now"
                                            name="Order Books Now"
                                            displayEmpty
                                            className={classes.selectEmpty}
                                            value={order_books}
                                            onChange={this.handleOrderBooks}
                                        >
                                            <MenuItem value="" disabled>
                                                Order Books Now
                                        </MenuItem>
                                            <MenuItem value={true}>Yes!</MenuItem>
                                            <MenuItem value={false}>No, not right now</MenuItem>
                                        </Select>
                                        <FormHelperText>Order Books Now</FormHelperText>
                                    </FormControl>
                                </Paper>
                            </Grid>
                            <Paper>
                                <Typography variant='display2'>Dietary</Typography>
                                {/* <Typography variant='headline' >Please List ALL Dietary Concerns</Typography> */}
                                <TextField
                                    id="multiline-flexible"
                                    label="Please List ALL Dietary Concerns"
                                    multiline
                                    rowsMax="4"
                                    onChange={(e) => this.handleUpdate({ what: 'dietary_concerns', val: e.target.value })}
                                    value={dietary_concerns}
                                    className={classes.textField}
                                    margin="normal"
                                />
                            </Paper>
                            <Paper>
                                <Typography
                                    variant='display2'
                                    style={{
                                        alignContent: 'center'
                                    }}
                                >Medical</Typography>
                                {/* <Typography variant='headline' >Please List ALL Medical Concerns</Typography> */}
                                <TextField
                                    id="multiline-flexible"
                                    label="Please List ALL Medical Concerns"
                                    multiline
                                    rowsMax="4"
                                    value={medical_concerns}
                                    onChange={(e) => this.handleUpdate({ what: 'medical_concerns', val: e.target.value })}
                                    className={classes.textField}
                                    margin="normal"
                                />
                                <Typography variant='headline' >Health Care Number</Typography>
                                <Input
                                    placeholder="Health Care Number"
                                    className={classes.input}
                                    inputProps={{
                                        'aria-label': 'Description',
                                    }}
                                    onChange={(e) => this.handleUpdate({ what: 'health_card_num', val: e.target.value })}
                                    value={health_card_num}
                                />
                                <input
                                    type="text"
                                    onChange={(e) => this.handleUpdate({ what: 'health_card_num', val: e.target.value })}
                                    value={health_card_num}
                                />
                            </Paper>
                            <Paper>
                                <Typography variant='display2' >Comments</Typography>
                                <TextField
                                    id="multiline-flexible"
                                    label="Anything else you want to tell us?"
                                    multiline
                                    rowsMax="4"
                                    value={comments}
                                    onChange={(e) => this.handleUpdate({ what: 'comments', val: e.target.value })}
                                    className={classes.textField}
                                    margin="normal"
                                />
                            </Paper>
                        </Grid>
                        <Paper>
                            {/* <Grid item xs={12}
                                style={{
                                    height: "80px",
                                }}
                            > */}
                            <Grid
                                container
                                spacing={8}
                                direction="row"
                                justify="center"
                                style={{
                                    padding: 10
                                }}
                                alignContent='space-around'
                            >
                                <Grid item>
                                    <Button
                                        component={Link}
                                        to="/user/dashboard"
                                        color='primary'
                                        variant="contained"
                                        fullWidth
                                    >
                                        Cancel
                                        </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        component={Link}
                                        to="/user/register/1"
                                        color='primary'
                                        variant="contained"
                                        fullWidth
                                    >
                                        Previous
                                        </Button>
                                </Grid>
                                <Grid item >
                                    <Button
                                        component={Link}
                                        to="/user/register/3"
                                        color='primary'
                                        variant="contained"
                                        fullWidth
                                    >
                                        Save and Continue
                                        </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </div>
                ) : (
                        <div>
                            <h1>Please Sign in</h1>
                        </div >
                    )
                }
            </div>
        )
    }
}


function mapStateToProps(state) {
    const { participant, user } = state;
    return {
        camper: participant,
        user
    }
}

const mapDispatchToProps = {
    updateUser,
    updateNestedObject
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Part2))
