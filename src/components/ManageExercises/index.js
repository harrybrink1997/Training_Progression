import React, { Component } from 'react'
import { Button, Loader, Card, Icon } from 'semantic-ui-react'
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import PageBodyLoader from '../CustomComponents/pageBodyLoader'
import CreateExerciseForm from './createExerciseForm'
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
                this.props.firebase.getAnatomyData()
            ]).then(data => {
                this.setState({
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
                }
            ],
            data: []
        }

        if (list.length > 0) {
            payload.data.map(ex => {
                return {
                    name: ex.name,
                    experience: ex.experience,
                    primary: ex.primary,
                    secondary: ex.secondary,
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
    }

    initCurrentExerciseList = (list) => {
        let payload = list.map(ex => {
            return list.name.replace("_", " ")
        })
        return payload
    }

    handleDeleteExercise = (name) => {
        this.setState({
            loading: true
        }, () => {

        })
    }

    handleCreateExercise = (name, primary, secondary, experience) => {
        let payload = {
            experience: experience,
            primary: primary,
            secondary: secondary,
            name: name
        }
    }

    render() {
        const {
            loading,
            view,
            anatomy,
            currentExerciseNames,
            exerciseTableData
        } = this.state

        let loadingHTML =
            <PageBodyLoader>
                <Loader
                    active inline='centered' content='Collecting Exercise Data...' />
            </PageBodyLoader>

        let nonLoadingHTML =
            <div>
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
                        currentList={currentExerciseNames}
                    />
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