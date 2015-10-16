
import EmulateDom from '../testHelpers/emulateDom';

import GlobalHook from '../globalHook';

import React from 'react/addons';

import Unexpected from 'unexpected';

const expect = Unexpected.clone();
const TestUtils = React.addons.TestUtils;


const versionParts = React.version.split('.');
const isReact014 = (parseFloat(versionParts[0] + '.' + versionParts[1]) >= 0.14);

const TestComponent = React.createClass({

    render() {
        return <div className={this.props.className}>Test Component</div>;
    }
});

class ClassComponent extends React.Component {

    render() {
        return <div className="class-component">{this.props.injectChildren}</div>;
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

            const component = TestUtils.renderIntoDocument(<TestComponent />);

            const locatedComponent = GlobalHook.findComponent(component);

            expect(locatedComponent, 'to satisfy', {
                element: expect.it('to be an', 'object'),
                data: {
                    nodeType: 'Composite',
                    type: expect.it('to be', TestComponent),    // Unexpected calls functions that are in 'to satisfy'
                    name: 'TestComponent'                       // Hence the extra `expect.it()`
                }
            });
        });

        it('finds a class component', () => {

            const component = TestUtils.renderIntoDocument(<ClassComponent />);

            const locatedComponent = GlobalHook.findComponent(component);

            expect(locatedComponent, 'to satisfy', {
                element: expect.it('to be an', 'object'),
                data: {
                    nodeType: 'Composite',
                    type: expect.it('to be', ClassComponent),
                    name: 'ClassComponent'
                }
            });
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
                    element: expect.it('to be an', 'object'),
                    data: {
                        nodeType: 'Native',
                        type: 'div',
                        props: {
                            className: 'class-component'
                        }
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
                    element: expect.it('to be an', 'object'),
                    data: {
                        nodeType: 'Native',
                        type: 'div'
                    }
                }]);

            });

            it('returns the CompositeComponent as a child of the div', () => {

                const theDiv = GlobalHook.findChildren(component);
                const divChildren = GlobalHook.findChildren(theDiv[0]);
                expect(divChildren, 'to satisfy', [{
                    element: expect.it('to be an', 'object'),
                    data: {
                        nodeType: 'Composite',
                        type: expect.it('to be', TestComponent)
                    }
                }]);
            });
        });
    });
});

