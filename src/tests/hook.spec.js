
import EmulateDom from '../testHelpers/emulateDom';

import GlobalHook from '../globalHook';

import React from 'react';
import TestUtils from 'react-dom/test-utils';
import createClass from 'create-react-class';
import Unexpected from 'unexpected';

const expect = Unexpected.clone();


const versionParts = React.version.split('.');
const isReact014 = (parseFloat(versionParts[0] + '.' + versionParts[1]) >= 0.14);

const TestComponent = createClass({

  displayName: 'TestComponent',
    render() {
        return <div className={this.props.className}>Test Component</div>;
    }
});

class ClassComponent extends React.Component {

    constructor() {
        super();
        this.state = { };

        this.onClick = this.onClick.bind(this);

    }

    onClick() {
        this.setState({
            id: 'clicked'
        });
    }

    render() {
        return <div className="class-component" id={this.state.id} onClick={this.onClick}>{this.props.injectChildren}</div>;
    }
}

function FuncComponent(props) {

    return null;
}


describe('react-render-hook', () => {

    it('identifies as attached', () => {

        expect(GlobalHook.isAttached, 'to be true');
    });

    describe('findComponent', () => {


        it('finds a component using renderIntoDocument', () => {

            const component = TestUtils.renderIntoDocument(<TestComponent className="foo"/>);

            const locatedComponent = GlobalHook.findComponent(component);

            expect(locatedComponent, 'to satisfy', {
                data: {
                    nodeType: 'Composite',
                    type: expect.it('to be', TestComponent),    // Unexpected calls functions that are in 'to satisfy'
                    name: 'TestComponent',                      // Hence the extra `expect.it()`
                    publicInstance: {
                        props: { className: 'foo' }
                    }
                }
            });

        });

      it('finds the correct component when rendering more than one', () => {

        const component = TestUtils.renderIntoDocument(<TestComponent className="foo"/>);
        const component2 = TestUtils.renderIntoDocument(<TestComponent className="bar"/>);

        const locatedComponent = GlobalHook.findComponent(component);
        const locatedComponent2 = GlobalHook.findComponent(component2);

        expect(locatedComponent, 'to satisfy', {
          data: {
            nodeType: 'Composite',
            type: expect.it('to be', TestComponent),    // Unexpected calls functions that are in 'to satisfy'
            name: 'TestComponent',                      // Hence the extra `expect.it()`
            publicInstance: {
              props: { className: 'foo' }
            }
          }
        });

        expect(locatedComponent2, 'to satisfy', {
          data: {
            nodeType: 'Composite',
            type: expect.it('to be', TestComponent),    // Unexpected calls functions that are in 'to satisfy'
            name: 'TestComponent',                      // Hence the extra `expect.it()`
            publicInstance: {
              props: { className: 'bar' }
            }
          }
        });
      });

        it('finds a class component', () => {

            const component = TestUtils.renderIntoDocument(<ClassComponent />);

            const locatedComponent = GlobalHook.findComponent(component);

            expect(locatedComponent, 'to satisfy', {
                data: {
                    nodeType: 'Composite',
                    type: expect.it('to be', ClassComponent),
                    name: 'ClassComponent',
                    publicInstance: expect.it('to be an', 'object')
                }
            });
        });

        it('clears the collection on clearAll()', () => {

            const component = TestUtils.renderIntoDocument(<ClassComponent />);

            let locatedComponent = GlobalHook.findComponent(component);

            expect(locatedComponent, 'not to be null');

            GlobalHook.clearAll();

            locatedComponent = GlobalHook.findComponent(component);

            expect(locatedComponent, 'to be null');
        });
    });

    describe('findChildren', () => {

        describe('with a native->string child', () => {

            let component;

            beforeEach(() => {

                component = TestUtils.renderIntoDocument(<ClassComponent injectChildren="foo"/>);
                // renders <ClassComponent><div className="class-component">foo</div></ClassComponent>
            });

            it('returns a native node', () => {

                const locatedComponent = GlobalHook.findChildren(component);

                expect(locatedComponent, 'to satisfy', [{
                    data: {
                        nodeType: 'Native',
                        type: 'div',
                        props: {
                            className: 'class-component'
                        },
                        publicInstance: expect.it('to be an', 'object'),
                    }
                }]);
            });

            it('returns the string child of the first child', () => {

                const theDiv = GlobalHook.findChildren(component);
                const divContent = GlobalHook.findChildren(theDiv[0]);

                expect(divContent, 'to equal', ['foo']);
            });

        });

        describe('with a native->Composite child', () => {

            let component;

            beforeEach(() => {

                component = TestUtils.renderIntoDocument(<ClassComponent injectChildren={<TestComponent />} />);
                /* renders
                <ClassComponent>
                    <div className="class-component">
                        <TestComponent />
                    </div>
                </ClassComponent>

                 */
            });

            it('returns the native component', () => {

                const theDiv = GlobalHook.findChildren(component);
                expect(theDiv, 'to satisfy', [{
                    data: {
                        nodeType: 'Native',
                        type: 'div',
                      publicInstance: expect.it('to be an', 'object'),
                    }
                }]);

            });

            it('returns the CompositeComponent as a child of the div', () => {

                const theDiv = GlobalHook.findChildren(component);
                const divChildren = GlobalHook.findChildren(theDiv[0]);
                expect(divChildren, 'to satisfy', [{
                    data: {
                        nodeType: 'Composite',
                        type: expect.it('to be', TestComponent),
                        publicInstance: expect.it('to be an', 'object'),
                    }
                }]);
            });
        });

        describe('after an update', () => {

            let component;
            beforeEach(() => {
                    component = TestUtils.renderIntoDocument(<ClassComponent injectChildren={<TestComponent />} />);
            });

            it('returns the new children', () => {
                let classComp = GlobalHook.findChildren(component);


                expect(classComp, 'to satisfy', [{
                    data: {
                        nodeType: 'Native',
                        type: 'div',
                        props: {
                            id: undefined
                        }
                    }
                }]);

                const [div] = TestUtils.scryRenderedDOMComponentsWithTag(component, 'div');
                TestUtils.Simulate.click(div);
                classComp = GlobalHook.findChildren(component);

                expect(classComp, 'to satisfy', [{
                    data: {
                        nodeType: 'Native',
                        type: 'div',
                        props: {
                            id: 'clicked'
                        }
                    }
                }]);


            });


        })
    });
});
