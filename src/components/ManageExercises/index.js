import React, { Component } from 'react'
import { Button, Loader, Card, Icon } from 'semantic-ui-react'
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import PageBodyLoader from '../CustomComponents/pageBodyLoader'
import CreateExerciseForm from './createExerciseForm'
import BasicTablePagination from '../CustomComponents/basicTablePagination'
import * as ROUTES from '../../constants/routes'


class ManageExercisesPage extends Component {


    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            view: 'home'
        }
    }

    componentDidMount() {
        this.setState({ loading: true }, () => {
            Promise.all([
                this.props.firebase.getUserExerciseData(
                    this.props.firebase.auth.currentUser.uid
                ),
                this.props.firebase.getAnatomyData(),
                this.props.firebase.getExData(['none'])
            ]).then(data => {

                this.setState({
                    globalExerciseNames: this.initCurrentExerciseList(data[2]),
                    exerciseTableData: this.initCurrentExerciseTableData(data[0]),
                    currentExerciseNames: this.initCurrentExerciseList(data[0]),
                    anatomy: data[1].data().anatomy,
                    loading: false
                })
            })
        })
    }

    initCurrentExerciseTableData = (list) => {
        let payload = {
            columns: [
                {
                    Header: 'Exericise',
                    accessor: 'name'
                },
                {
                    Header: 'Primary Muscles',
                    accessor: 'primary'
                },
                {
                    Header: 'Secondary Muscles',
                    accessor: 'secondary'
                },
                {
                    Header: 'Experience',
                    accessor: 'experience'
                },
                {
                    accessor: 'buttons'
                }
            ],
            data: []
        }

        if (list.length > 0) {
            if (list.length === 1) {
                console.log(list)
            }
            payload.data = list.map(ex => {
                return {
                    name: ex.name.split("_").join(" "),
                    experience: ex.experience,
                    primary: ex.primary.join(","),
                    secondary: ex.secondary.join(", "),
                    buttons:
                        <Button
                            className="lightPurpleButton-inverted"
                            onClick={() => {
                                this.handleDeleteExercise(ex.name)
                            }}
                        >
                            Delete Exercise
                        </Button>
                }
            })
        }

        return payload
    }

    initCurrentExerciseList = (list) => {
        let payload = list.map(ex => {
            return ex.name.split("_").join(" ").toLowerCase()
        })
        return payload
    }

    handleDeleteExercise = (name) => {
        this.setState({
            loading: true
        }, () => {
            this.props.firebase.deleteLocalExercise(
                name,
                this.props.firebase.auth.currentUser.uid
            ).then(updatedLocalExercises => {
                this.setState({
                    currentExerciseNames: this.initCurrentExerciseList(updatedLocalExercises),
                    exerciseTableData: this.initCurrentExerciseTableData(updatedLocalExercises),
                    loading: false
                })
            })
        })
    }

    handleCreateExercise = (name, primary, secondary, experience) => {
        this.setState({
            loading: true
        }, () => {
            let payload = {
                experience: experience,
                primary: primary,
                secondary: secondary,
                name: name,
                owner: this.props.firebase.auth.currentUser.uid
            }
            console.log(payload)
            this.props.firebase.addNewLocalExercise(
                this.props.firebase.auth.currentUser.uid,
                payload
            ).then(updatedLocalExercises => {
                this.setState({
                    currentExerciseNames: this.initCurrentExerciseList(updatedLocalExercises),
                    exerciseTableData: this.initCurrentExerciseTableData(updatedLocalExercises),
                    loading: false
                })
            })
        })
    }
    handleBackClick = () => {
        if (this.state.view !== 'home') {
            this.setState({
                view: 'home'
            })
        } else {
            this.props.history.push(ROUTES.HOME)
        }
    }
    render() {
        const {
            loading,
            view,
            anatomy,
            currentExerciseNames,
            globalExerciseNames,
            exerciseTableData
        } = this.state

        let loadingHTML =
            <PageBodyLoader>
                <Loader
                    active inline='centered' content='Collecting Exercise Data...' />
            </PageBodyLoader>

        let nonLoadingHTML =
            <div>
                <div className='rowContainer clickableDiv'>
                    <Button
                        content='Back'
                        className='backButton-inverted'
                        circular
                        icon='arrow left'
                        onClick={() => {
                            this.handleBackClick()

                        }}
                    />
                </div>
                {
                    view === 'home' &&
                    <div id='programAssignmentCardGroupContainer'>
                        <Card.Group>
                            <div>
                                <Card onClick={() => {
                                    this.setState({
                                        view: 'createExercise'
                                    })
                                }}
                                >
                                    <Card.Content className='iconContent'>
                                        <Icon name='file alternate outline' size='huge' />
                                    </Card.Content>
                                    <Card.Content>
                                        <Card.Header textAlign='center'>Add <br /> Exercise</Card.Header>
                                    </Card.Content>
                                </Card>
                            </div>
                            <div>
                                <Card onClick={() => {
                                    this.setState({
                                        view: 'viewExercises'
                                    })
                                }}
                                >
                                    <Card.Content className='iconContent'>
                                        <Icon name='group' size='huge' />
                                    </Card.Content>
                                    <Card.Content>
                                        <Card.Header textAlign='center'>View <br /> Exercises</Card.Header>
                                    </Card.Content>
                                </Card>
                            </div>
                        </Card.Group>
                    </div>
                }
                {
                    view === 'createExercise' &&
                    <CreateExerciseForm
                        handleFormSubmit={this.handleCreateExercise}
                        anatomyObject={anatomy}
                        currentList={[...currentExerciseNames, ...globalExerciseNames]}
                    />
                }
                {
                    view === 'viewExercises' &&
                    <div className='centred-info'>
                        <div className='half-width'>
                            <BasicTablePagination
                                data={exerciseTableData.data}
                                columns={exerciseTableData.columns}
                            />
                        </div>
                    </div>
                }
            </div>

        return (
            <NonLandingPageWrapper>
                {loading && loadingHTML}
                {!loading && nonLoadingHTML}
            </NonLandingPageWrapper>
        )
    }

}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ManageExercisesPage);