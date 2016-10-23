import React, {Component} from 'react';
import api from './api';
import moment from 'moment';
import Datetime from 'react-datetime';
import queryString from 'query-string';

import Pagination from './Pagination';

import 'react-datetime/css/react-datetime.css'

const dateFormat = 'YYYY-MM-DD HH:mm';
const filterFormat = {
    type: '',
    start: '',
    end: ''
};

class App extends Component {

    state = {
        list: [],
        filterProperties: {
            types: [],
            max_date: '',
            min_date: ''
        },
        pagination: {
            currPage: 1,
            totalPages: 0,
            limit: 5
        },
        loading: true,
        error: false,
        filter: filterFormat
    };

    getFilterProperties() {
        return api('properties', null, this.onServerRequestError).get();
    }

    updateData(filter = this.state.filter, page = this.state.pagination.currPage) {
        this.setState({
            filter: {
                ...this.state.filter,
                ...filter
            },
            pagination: {
                ...this.state.pagination,
                currPage: page
            },
            loading: true
        });
        api
        (
            'log',
            {
                f: filter,
                limit: this.state.pagination.limit,
                offset: (page - 1) * this.state.pagination.limit
            },
            this.onServerRequestError
        )
            .get()
            .then((response) => {
                if (response.status == 200)
                    this.setState({
                        list: response.data.payload.collection,
                        loading: false,
                        pagination: {
                            ...this.state.pagination,
                            ...response.data.payload.pagination
                        },
                        error: null
                    })
                else {
                    this.setState({loading: false, error: response.data.error.message});
                }
            })
    }

    onServerRequestError = error => {
        this.setState({loading: false, error: error});
    }

    parseHash() {
        let query = queryString.parse(location.hash);
        let page = query.page;
        delete query.page;
        this.updateData(query, page);
    }

    updateHash(filter) {
        location.hash = queryString.stringify(filter).replace(/[^=&]+=(&|$)/g, "").replace(/&$/, "");
    }

    filter(key, value) {
        let filter = this.state.filter;
        filter[key] = value;
        this.updateHash(filter);
    }

    onDateChange(key, value) {
        if (value._isAMomentObject || value === "") {
            if (value._isAMomentObject)
                value = value.format(dateFormat);
            this.filter(key, value)
        }
    }

    onPageSelect(page) {
        if (page < 1 || page > this.state.pagination.totalPages) return false;
        this.updateHash({...this.state.filter, page});
        window.scrollTo(0, 0);
    }

    checkDate = current => {
        if (current < this.state.filterProperties.min_date || current > this.state.filterProperties.max_date) {
            return false;
        }
        return true;
    }

    onHashUpdate = () => {
        const isEquivalent = (a, b) => {
            let props = Object.getOwnPropertyNames(a);
            for(let i = 0; i < props.length; i++){
                let propName = props[i];
                if (a[propName] !== b[propName]) {
                    return false;
                }
            }
            return true;
        }

        const query = {...filterFormat, ...queryString.parse(location.hash)};

        if(!isEquivalent(query, {...this.filter, page: this.state.pagination.currPage})){
            let page = 1;
            if(query.page){
                page = query.page;
                delete query.page;
            }
            this.setState({
                filter: {
                    ...this.state.filter,
                    ...query
                }
            });
            this.updateData(query, page);
        }
    }

    componentDidMount() {
        window.addEventListener("hashchange", this.onHashUpdate, false);

        this.getFilterProperties().then((response) => {
            if (response.status == 200) {
                let filterProperties = response.data.payload;
                filterProperties.min_date = moment(filterProperties.min_date, dateFormat).subtract(1, "days");
                filterProperties.max_date = moment(filterProperties.max_date, dateFormat);
                this.setState({
                    filterProperties,
                    loading: true
                });
                if (location.hash)
                    this.parseHash()
                else {
                    this.updateData();
                }
            } else {
                this.setState({loading: false, error: response.error.message});
            }
        })
    }

    render() {
        let list = null;
        const loader = (<div><span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"/> Loading data...</div>);
        if (this.state.list.length) {
            list = this.state.list.map((item) => {
                return (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.type}</td>
                        <td>{item.createdAt}</td>
                        <td>{item.data}</td>
                        <td className="text-center">{(item.deleted) ? <span className="glyphicon glyphicon-ok"/> : <span className="glyphicon glyphicon-remove"/>}</td>
                        <td>{item.code}</td>
                        <td>{item.ip}</td>
                        <td>{item.email}</td>
                    </tr>
                )
            });
        } else {
            list = (
                <tr>
                    <td colSpan="8" className="text-center">No data</td>
                </tr>
            )
        }

        return (
            <div className="container">
                {(this.state.error) ? <div className="alert alert-danger">{this.state.error}</div> : null}
                <h2>API filter test</h2>
                <form className="row">
                    <div className="col-md-4 form-group">
                        <label htmlFor="">Type:</label>
                        <select
                            className="form-control"
                            value={this.state.filter.type}
                            onChange={(e) => this.filter('type', e.target.value)}>
                            <option value="">all</option>
                            {this.state.filterProperties.types.map((item, index) => {
                                return <option key={index}>{item}</option>
                            })}
                        </select>
                    </div>
                    <div className="col-md-4 form-group">
                        <label htmlFor="">From:</label>
                        <Datetime dateFormat="YYYY-MM-DD"
                                  timeFormat="HH:mm"
                                  closeOnSelect
                                  value={this.state.filter.start}
                                  onChange={(value) => this.onDateChange('start', value)}
                                  isValidDate={this.checkDate}/>
                    </div>
                    <div className="col-md-4 form-group">
                        <label htmlFor="">To:</label>
                        <Datetime dateFormat="YYYY-MM-DD"
                                  timeFormat="HH:mm"
                                  closeOnSelect
                                  value={this.state.filter.end}
                                  onChange={(value) => this.onDateChange('end', value)}
                                  isValidDate={this.checkDate}/>
                    </div>
                </form>
                <div className="table-wrapper">
                    {this.state.loading
                        ? <div className="loading-info">{loader}</div>
                        : null
                    }
                    <table className="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <td>ID</td>
                            <td>Type</td>
                            <td>Date</td>
                            <td>Data</td>
                            <td>Deleted</td>
                            <td>Code</td>
                            <td>IP</td>
                            <td>Email</td>
                        </tr>
                        </thead>
                        <tbody>
                        {list}
                        </tbody>
                    </table>
                </div>
                {(this.state.list.length && this.state.pagination.totalPages > 0)
                    ? <Pagination
                    currPage={Number.parseInt(this.state.pagination.currPage)}
                    totalPages={this.state.pagination.totalPages}
                    onSelect={this.onPageSelect.bind(this)}/>
                    : null
                }
            </div>
        );
    }
}

export default App;
