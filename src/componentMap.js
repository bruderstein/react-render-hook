
const nodes = new Map();

let mountId = 1;
exports.mount = function (component) {

    const rootNodeID = getNodeId(component); // component.element._rootNodeID;
    let elementsInRoot = nodes.get(rootNodeID);
    if (elementsInRoot === undefined) {
        elementsInRoot = [];
        nodes.set(rootNodeID, elementsInRoot);
    }
    elementsInRoot.push(component);
};

function getNodeId(component) {
    return '' + ((component.element && component.element._rootNodeID) || (component.internalInstance && component.internalInstance._debugID) || '');
}

exports.update = function (component) {
    const existing = exports.findInternalComponent(component.internalInstance);
    if (existing) {
        existing.data = component.data;
    }
};

exports.findComponent = function (component) {
    if (component && component._reactInternalInstance) {
        const elementsInRoot = nodes.get(component._reactInternalInstance._rootNodeID || (component._reactInternalInstance._debugID + ''));
        if (elementsInRoot) {
            for (let index = elementsInRoot.length - 1; index >= 0; --index) {
                if (elementsInRoot[index].data.publicInstance === component) {
                    const renderedComponent = elementsInRoot[index];
                    if (renderedComponent.data.nodeType === 'NativeWrapper') {
                        return exports.findInternalComponent(renderedComponent.data.children[0]);
                    }
                    return renderedComponent;
                }
            }
        }
    }

    return null;
};

exports.findInternalComponent = function (internalComponent) {
    if (internalComponent) {
        const elementsInRoot = nodes.get(internalComponent._rootNodeID || internalComponent._debugID + '');
        if (elementsInRoot) {
            for (let index = elementsInRoot.length - 1; index >= 0; --index) {
                if (elementsInRoot[index].element === internalComponent || elementsInRoot[index].internalInstance === internalComponent) {
                    return elementsInRoot[index];
                }
            }
        }

    }
};

exports.getNodes = function () {
    return nodes;
}

exports.clearAll = function () {
   nodes.clear();
};
