import Unexpected from 'unexpected';

import ComponentMap from '../componentMap';

const expect = Unexpected.clone();

function TestElement(name) {
  this.props = {};
    // Just some property for identification later - doesn't matter what it is
    this.name = name;
}

function getInternalInstance(publicInstance) {
    return {
        stateNode: publicInstance
    };
}

describe('componentMap', () => {


    let testInstance1, testInternalInstance1;
    let testInstance2, testInternalInstance2;
    let testInstance2b, testInternalInstance2b;
    beforeEach(function () {

      testInstance1 = new TestElement('one');
      testInternalInstance1 = getInternalInstance(testInstance1);
      testInstance2 = new TestElement('two');
      testInternalInstance2 = getInternalInstance(testInstance2);
      testInstance2b = new TestElement('two -second');
      testInternalInstance2b = getInternalInstance(testInstance2b);
    });

    it('finds a single added component', () => {

        ComponentMap.mount({
            internalInstance: testInternalInstance1,
            data: { test: 123, publicInstance: testInstance1 }
        });

        const located = ComponentMap.findComponent(testInstance1);
        expect(located, 'to satisfy', {
            data: { test: 123 }
        });

    });

    it('finds a component when two different roots are added', () => {

        ComponentMap.mount({
            internalInstance: testInternalInstance1,
            data: { test: 123, publicInstance: testInstance1 }
        });

        ComponentMap.mount({
            internalInstance: testInternalInstance2,
            data: { test: 123, publicInstance: testInstance2 }
        });

        const located = ComponentMap.findComponent(testInstance1);
        expect(located, 'to satisfy', {
            data: { test: 123 }
        });
    });

    it('finds a component when two different components in the same root', () => {

        ComponentMap.mount({
            internalInstance: testInternalInstance2,
            data: { test: 123, publicInstance: testInstance2 }
        });

        ComponentMap.mount({
            internalInstance: testInternalInstance2b,
            data: { test: 234, publicInstance: testInstance2b }
        });

        const located = ComponentMap.findComponent(testInstance2);
        expect(located, 'to satisfy', {
            data: { test: 123 }
        });

        const second = ComponentMap.findComponent(testInstance2b);
        expect(second, 'to satisfy', {
            data: { test: 234 }
        });
    });

    it('does not find a component after clearAll()', () => {

        ComponentMap.mount({
            internalInstance: testInternalInstance2,
            data: { test: 123, publicInstance: testInstance2 }
        });

        ComponentMap.clearAll();

        const located = ComponentMap.findComponent(testInstance2);
        expect(located, 'to be null');
    });

    it('allows updating an instance', () => {

        ComponentMap.mount({
            internalInstance: testInternalInstance2,
            data: { test: 123, publicInstance: testInstance2 }
        });

        ComponentMap.update({
            internalInstance: testInternalInstance2,
            data: { test: 234, publicInstance: testInstance2 }
        });
        const located = ComponentMap.findComponent(testInstance2);
        expect(located, 'to satisfy', { data: { test: 234 } });
    });

    it('ignores updates to unknown instances', () => {

        // This appears to happen when the shallow renderer is used
        ComponentMap.clearAll();

        ComponentMap.update({
            internalInstance: testInternalInstance2,
            data: { test: 234, publicInstance: testInstance2 }
        });
        const located = ComponentMap.findComponent(testInstance2);
        expect(located, 'to be null');
    });

});
