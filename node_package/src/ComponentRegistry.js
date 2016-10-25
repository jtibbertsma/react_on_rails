// key = name used by react_on_rails
// value = { name, component, generatorFunction: boolean }
import generatorFunction from './generatorFunction';

const registeredComponents = new Map();

export default {
  /**
   * @param components { component1: component1, component2: component2, etc. }
   */
  register(components) {
    Object.keys(components).forEach(name => {
      if (registeredComponents.has(name)) {
        console.warn('Called register for component that is already registered', name);
      }

      const component = components[name];
      if (!component) {
        throw new Error(`Called register with null component named ${name}`);
      }

      const isGeneratorFunction = generatorFunction(component);

      registeredComponents.set(name, {
        name,
        component,
        generatorFunction: isGeneratorFunction,
        isRenderer: false,
      });
    });
  },

  /**
   * @param renderers { renderers1: renderers1, renderers2: renderers2, etc. }
   */
  registerRenderer(renderers) {
    Object.keys(renderers).forEach(name => {
      if (registeredComponents.has(name)) {
        console.warn('Called registerRenderer for component that is already registered', name);
      }

      const renderer = renderers[name];

      // A renderer must be a function
      if (!generatorFunction(renderer)) {
        throw new Error(`Called registerRenderer without passing a function; component name \
is ${name}`);
      }

      registeredComponents.set(name, {
        name,
        component: renderer,
        generatorFunction: false,
        isRenderer: true,
      });
    });
  },

  /**
   * @param name
   * @returns { name, component, generatorFunction }
   */
  get(name) {
    if (registeredComponents.has(name)) {
      return registeredComponents.get(name);
    }

    const keys = Array.from(registeredComponents.keys()).join(', ');
    throw new Error(`Could not find component registered with name ${name}. \
Registered component names include [ ${keys} ]. Maybe you forgot to register the component?`);
  },

  /**
   * Get a Map containing all registered components. Useful for debugging.
   * @returns Map where key is the component name and values are the
   * { name, component, generatorFunction}
   */
  components() {
    return registeredComponents;
  },
};
