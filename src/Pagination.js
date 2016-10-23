import React, {Component} from 'react';
import Paginator from 'react-pagify';
import segmentize from 'segmentize';

class Pagination extends Component {
    render() {
        return (
            <div className="text-center">
                <Paginator.Context
                    className="pagination text-center"
                    tags={{
                    container: {tag: 'ul'},
                    segment: {tag: 'li'},
                    ellipsis: {
                        tag: 'li',
                            props: {
                            className: 'disabled',
                                children: <span>...</span>
                        }
                    },
                    link: {
                        tag: 'a'
                    }
                }}
                    segments={segmentize({
                    pages: (this.props.totalPages == 0) ? 1 : this.props.totalPages,
                    page: this.props.currPage,
                    beginPages: 1,
                    endPages: 1,
                    sidePages: 3
                })}
                    onSelect={this.props.onSelect}>
                    <Paginator.Button
                        page={this.props.currPage - 1}
                        className={this.props.currPage - 1 < 1 ? 'disabled' : ''}>
                        Prev
                    </Paginator.Button>
                    <Paginator.Segment field="beginPages" />
                    <Paginator.Ellipsis previousField="beginPages" nextField="previousPages" />
                    <Paginator.Segment field="previousPages" />
                    <Paginator.Segment field="centerPage" className="active" />
                    <Paginator.Segment field="nextPages" />
                    <Paginator.Ellipsis previousField="nextPages" nextField="endPages" />
                    <Paginator.Segment field="endPages" />
                    <Paginator.Button
                        page={this.props.currPage + 1}
                        className={this.props.currPage + 1 > this.props.totalPages ? 'disabled' : ''}>
                        Next
                    </Paginator.Button>
                </Paginator.Context>
            </div>
        )
    }
}
export default Pagination;