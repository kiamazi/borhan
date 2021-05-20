
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    //------------------ Sura Data ---------------------
    const Sura = [
    	// [start, ayas, order, rukus, name, tname, ename, type]
    	[0, 7, 5, 1, 'الفاتحة', "Al-Faatiha", 'The Opening', 'Meccan'],
    	[7, 286, 87, 40, 'البقرة', "Al-Baqara", 'The Cow', 'Medinan'],
    	[293, 200, 89, 20, 'آل عمران', "Aal-i-Imraan", 'The Family of Imraan', 'Medinan'],
    	[493, 176, 92, 24, 'النساء', "An-Nisaa", 'The Women', 'Medinan'],
    	[669, 120, 112, 16, 'المائدة', "Al-Maaida", 'The Table', 'Medinan'],
    	[789, 165, 55, 20, 'الأنعام', "Al-An'aam", 'The Cattle', 'Meccan'],
    	[954, 206, 39, 24, 'الأعراف', "Al-A'raaf", 'The Heights', 'Meccan'],
    	[1160, 75, 88, 10, 'الأنفال', "Al-Anfaal", 'The Spoils of War', 'Medinan'],
    	[1235, 129, 113, 16, 'التوبة', "At-Tawba", 'The Repentance', 'Medinan'],
    	[1364, 109, 51, 11, 'يونس', "Yunus", 'Jonas', 'Meccan'],
    	[1473, 123, 52, 10, 'هود', "Hud", 'Hud', 'Meccan'],
    	[1596, 111, 53, 12, 'يوسف', "Yusuf", 'Joseph', 'Meccan'],
    	[1707, 43, 96, 6, 'الرعد', "Ar-Ra'd", 'The Thunder', 'Medinan'],
    	[1750, 52, 72, 7, 'ابراهيم', "Ibrahim", 'Abraham', 'Meccan'],
    	[1802, 99, 54, 6, 'الحجر', "Al-Hijr", 'The Rock', 'Meccan'],
    	[1901, 128, 70, 16, 'النحل', "An-Nahl", 'The Bee', 'Meccan'],
    	[2029, 111, 50, 12, 'الإسراء', "Al-Israa", 'The Night Journey', 'Meccan'],
    	[2140, 110, 69, 12, 'الكهف', "Al-Kahf", 'The Cave', 'Meccan'],
    	[2250, 98, 44, 6, 'مريم', "Maryam", 'Mary', 'Meccan'],
    	[2348, 135, 45, 8, 'طه', "Taa-Haa", 'Taa-Haa', 'Meccan'],
    	[2483, 112, 73, 7, 'الأنبياء', "Al-Anbiyaa", 'The Prophets', 'Meccan'],
    	[2595, 78, 103, 10, 'الحج', "Al-Hajj", 'The Pilgrimage', 'Medinan'],
    	[2673, 118, 74, 6, 'المؤمنون', "Al-Muminoon", 'The Believers', 'Meccan'],
    	[2791, 64, 102, 9, 'النور', "An-Noor", 'The Light', 'Medinan'],
    	[2855, 77, 42, 6, 'الفرقان', "Al-Furqaan", 'The Criterion', 'Meccan'],
    	[2932, 227, 47, 11, 'الشعراء', "Ash-Shu'araa", 'The Poets', 'Meccan'],
    	[3159, 93, 48, 7, 'النمل', "An-Naml", 'The Ant', 'Meccan'],
    	[3252, 88, 49, 8, 'القصص', "Al-Qasas", 'The Stories', 'Meccan'],
    	[3340, 69, 85, 7, 'العنكبوت', "Al-Ankaboot", 'The Spider', 'Meccan'],
    	[3409, 60, 84, 6, 'الروم', "Ar-Room", 'The Romans', 'Meccan'],
    	[3469, 34, 57, 3, 'لقمان', "Luqman", 'Luqman', 'Meccan'],
    	[3503, 30, 75, 3, 'السجدة', "As-Sajda", 'The Prostration', 'Meccan'],
    	[3533, 73, 90, 9, 'الأحزاب', "Al-Ahzaab", 'The Clans', 'Medinan'],
    	[3606, 54, 58, 6, 'سبإ', "Saba", 'Sheba', 'Meccan'],
    	[3660, 45, 43, 5, 'فاطر', "Faatir", 'The Originator', 'Meccan'],
    	[3705, 83, 41, 5, 'يس', "Yaseen", 'Yaseen', 'Meccan'],
    	[3788, 182, 56, 5, 'الصافات', "As-Saaffaat", 'Those drawn up in Ranks', 'Meccan'],
    	[3970, 88, 38, 5, 'ص', "Saad", 'The letter Saad', 'Meccan'],
    	[4058, 75, 59, 8, 'الزمر', "Az-Zumar", 'The Groups', 'Meccan'],
    	[4133, 85, 60, 9, 'غافر', "Al-Ghaafir", 'The Forgiver', 'Meccan'],
    	[4218, 54, 61, 6, 'فصلت', "Fussilat", 'Explained in detail', 'Meccan'],
    	[4272, 53, 62, 5, 'الشورى', "Ash-Shura", 'Consultation', 'Meccan'],
    	[4325, 89, 63, 7, 'الزخرف', "Az-Zukhruf", 'Ornaments of gold', 'Meccan'],
    	[4414, 59, 64, 3, 'الدخان', "Ad-Dukhaan", 'The Smoke', 'Meccan'],
    	[4473, 37, 65, 4, 'الجاثية', "Al-Jaathiya", 'Crouching', 'Meccan'],
    	[4510, 35, 66, 4, 'الأحقاف', "Al-Ahqaf", 'The Dunes', 'Meccan'],
    	[4545, 38, 95, 4, 'محمد', "Muhammad", 'Muhammad', 'Medinan'],
    	[4583, 29, 111, 4, 'الفتح', "Al-Fath", 'The Victory', 'Medinan'],
    	[4612, 18, 106, 2, 'الحجرات', "Al-Hujuraat", 'The Inner Apartments', 'Medinan'],
    	[4630, 45, 34, 3, 'ق', "Qaaf", 'The letter Qaaf', 'Meccan'],
    	[4675, 60, 67, 3, 'الذاريات', "Adh-Dhaariyat", 'The Winnowing Winds', 'Meccan'],
    	[4735, 49, 76, 2, 'الطور', "At-Tur", 'The Mount', 'Meccan'],
    	[4784, 62, 23, 3, 'النجم', "An-Najm", 'The Star', 'Meccan'],
    	[4846, 55, 37, 3, 'القمر', "Al-Qamar", 'The Moon', 'Meccan'],
    	[4901, 78, 97, 3, 'الرحمن', "Ar-Rahmaan", 'The Beneficent', 'Medinan'],
    	[4979, 96, 46, 3, 'الواقعة', "Al-Waaqia", 'The Inevitable', 'Meccan'],
    	[5075, 29, 94, 4, 'الحديد', "Al-Hadid", 'The Iron', 'Medinan'],
    	[5104, 22, 105, 3, 'المجادلة', "Al-Mujaadila", 'The Pleading Woman', 'Medinan'],
    	[5126, 24, 101, 3, 'الحشر', "Al-Hashr", 'The Exile', 'Medinan'],
    	[5150, 13, 91, 2, 'الممتحنة', "Al-Mumtahana", 'She that is to be examined', 'Medinan'],
    	[5163, 14, 109, 2, 'الصف', "As-Saff", 'The Ranks', 'Medinan'],
    	[5177, 11, 110, 2, 'الجمعة', "Al-Jumu'a", 'Friday', 'Medinan'],
    	[5188, 11, 104, 2, 'المنافقون', "Al-Munaafiqoon", 'The Hypocrites', 'Medinan'],
    	[5199, 18, 108, 2, 'التغابن', "At-Taghaabun", 'Mutual Disillusion', 'Medinan'],
    	[5217, 12, 99, 2, 'الطلاق', "At-Talaaq", 'Divorce', 'Medinan'],
    	[5229, 12, 107, 2, 'التحريم', "At-Tahrim", 'The Prohibition', 'Medinan'],
    	[5241, 30, 77, 2, 'الملك', "Al-Mulk", 'The Sovereignty', 'Meccan'],
    	[5271, 52, 2, 2, 'القلم', "Al-Qalam", 'The Pen', 'Meccan'],
    	[5323, 52, 78, 2, 'الحاقة', "Al-Haaqqa", 'The Reality', 'Meccan'],
    	[5375, 44, 79, 2, 'المعارج', "Al-Ma'aarij", 'The Ascending Stairways', 'Meccan'],
    	[5419, 28, 71, 2, 'نوح', "Nooh", 'Noah', 'Meccan'],
    	[5447, 28, 40, 2, 'الجن', "Al-Jinn", 'The Jinn', 'Meccan'],
    	[5475, 20, 3, 2, 'المزمل', "Al-Muzzammil", 'The Enshrouded One', 'Meccan'],
    	[5495, 56, 4, 2, 'المدثر', "Al-Muddaththir", 'The Cloaked One', 'Meccan'],
    	[5551, 40, 31, 2, 'القيامة', "Al-Qiyaama", 'The Resurrection', 'Meccan'],
    	[5591, 31, 98, 2, 'الانسان', "Al-Insaan", 'Man', 'Medinan'],
    	[5622, 50, 33, 2, 'المرسلات', "Al-Mursalaat", 'The Emissaries', 'Meccan'],
    	[5672, 40, 80, 2, 'النبإ', "An-Naba", 'The Announcement', 'Meccan'],
    	[5712, 46, 81, 2, 'النازعات', "An-Naazi'aat", 'Those who drag forth', 'Meccan'],
    	[5758, 42, 24, 1, 'عبس', "Abasa", 'He frowned', 'Meccan'],
    	[5800, 29, 7, 1, 'التكوير', "At-Takwir", 'The Overthrowing', 'Meccan'],
    	[5829, 19, 82, 1, 'الإنفطار', "Al-Infitaar", 'The Cleaving', 'Meccan'],
    	[5848, 36, 86, 1, 'المطففين', "Al-Mutaffifin", 'Defrauding', 'Meccan'],
    	[5884, 25, 83, 1, 'الإنشقاق', "Al-Inshiqaaq", 'The Splitting Open', 'Meccan'],
    	[5909, 22, 27, 1, 'البروج', "Al-Burooj", 'The Constellations', 'Meccan'],
    	[5931, 17, 36, 1, 'الطارق', "At-Taariq", 'The Morning Star', 'Meccan'],
    	[5948, 19, 8, 1, 'الأعلى', "Al-A'laa", 'The Most High', 'Meccan'],
    	[5967, 26, 68, 1, 'الغاشية', "Al-Ghaashiya", 'The Overwhelming', 'Meccan'],
    	[5993, 30, 10, 1, 'الفجر', "Al-Fajr", 'The Dawn', 'Meccan'],
    	[6023, 20, 35, 1, 'البلد', "Al-Balad", 'The City', 'Meccan'],
    	[6043, 15, 26, 1, 'الشمس', "Ash-Shams", 'The Sun', 'Meccan'],
    	[6058, 21, 9, 1, 'الليل', "Al-Lail", 'The Night', 'Meccan'],
    	[6079, 11, 11, 1, 'الضحى', "Ad-Dhuhaa", 'The Morning Hours', 'Meccan'],
    	[6090, 8, 12, 1, 'الشرح', "Ash-Sharh", 'The Consolation', 'Meccan'],
    	[6098, 8, 28, 1, 'التين', "At-Tin", 'The Fig', 'Meccan'],
    	[6106, 19, 1, 1, 'العلق', "Al-Alaq", 'The Clot', 'Meccan'],
    	[6125, 5, 25, 1, 'القدر', "Al-Qadr", 'The Power, Fate', 'Meccan'],
    	[6130, 8, 100, 1, 'البينة', "Al-Bayyina", 'The Evidence', 'Medinan'],
    	[6138, 8, 93, 1, 'الزلزلة', "Az-Zalzala", 'The Earthquake', 'Medinan'],
    	[6146, 11, 14, 1, 'العاديات', "Al-Aadiyaat", 'The Chargers', 'Meccan'],
    	[6157, 11, 30, 1, 'القارعة', "Al-Qaari'a", 'The Calamity', 'Meccan'],
    	[6168, 8, 16, 1, 'التكاثر', "At-Takaathur", 'Competition', 'Meccan'],
    	[6176, 3, 13, 1, 'العصر', "Al-Asr", 'The Declining Day, Epoch', 'Meccan'],
    	[6179, 9, 32, 1, 'الهمزة', "Al-Humaza", 'The Traducer', 'Meccan'],
    	[6188, 5, 19, 1, 'الفيل', "Al-Fil", 'The Elephant', 'Meccan'],
    	[6193, 4, 29, 1, 'قريش', "Quraish", 'Quraysh', 'Meccan'],
    	[6197, 7, 17, 1, 'الماعون', "Al-Maa'un", 'Almsgiving', 'Meccan'],
    	[6204, 3, 15, 1, 'الكوثر', "Al-Kawthar", 'Abundance', 'Meccan'],
    	[6207, 6, 18, 1, 'الكافرون', "Al-Kaafiroon", 'The Disbelievers', 'Meccan'],
    	[6213, 3, 114, 1, 'النصر', "An-Nasr", 'Divine Support', 'Medinan'],
    	[6216, 5, 6, 1, 'المسد', "Al-Masad", 'The Palm Fibre', 'Meccan'],
    	[6221, 4, 22, 1, 'الإخلاص', "Al-Ikhlaas", 'Sincerity', 'Meccan'],
    	[6225, 5, 20, 1, 'الفلق', "Al-Falaq", 'The Dawn', 'Meccan'],
    	[6230, 6, 21, 1, 'الناس', "An-Naas", 'Mankind', 'Meccan'],
    ];

    //------------------ Juz Data ---------------------
    const Juz = [
    	// start from [suraNumber, ayaNumberInSura, ayaNumberInQuran]
    	[1, 1, 0],      [2, 142, 148],  [2, 253, 259],  [3, 93, 385],   [4, 24, 516],
    	[4, 148, 640],  [5, 82, 750],   [6, 111, 899],  [7, 88, 1041],  [8, 41, 1200],
    	[9, 93, 1327],  [11, 6, 1478],  [12, 53, 1648], [15, 1, 1802],  [17, 1, 2029],
    	[18, 75, 2214], [21, 1, 2483],  [23, 1, 2673],  [25, 21, 2875], [27, 56, 3214],
    	[29, 46, 3385], [33, 31, 3563], [36, 28, 3732], [39, 32, 4089], [41, 47, 4264],
    	[46, 1, 4510],  [51, 31, 4705], [58, 1, 5104],  [67, 1, 5241],  [78, 1, 5672],
    	[115,1,6236] //fake index
    ];

    //------------------ Hizb Data ---------------------
    const Hizb = [
    	// [suraNumber, ayaNumberInSura, ayaNumberInQuran]
    	[1, 1, 0],        [2, 26, 32],      [2, 44, 50],      [2, 60, 66],
    	[2, 75, 81],      [2, 92, 98],      [2, 106, 112],    [2, 124, 130],
    	[2, 142, 148],    [2, 158, 164],    [2, 177, 183],    [2, 189, 195],
    	[2, 203, 209],    [2, 219, 225],    [2, 233, 239],    [2, 243, 249],
    	[2, 253, 259],    [2, 263, 269],    [2, 272, 278],    [2, 283, 289],
    	[3, 15, 307],     [3, 33, 325],     [3, 52, 344],     [3, 75, 367],
    	[3, 93, 385],     [3, 113, 405],    [3, 133, 425],    [3, 153, 445],
    	[3, 171, 463],    [3, 186, 478],    [4, 1, 493],      [4, 12, 504],
    	[4, 24, 516],     [4, 36, 528],     [4, 58, 550],     [4, 74, 566],
    	[4, 88, 580],     [4, 100, 592],    [4, 114, 606],    [4, 135, 627],
    	[4, 148, 640],    [4, 163, 655],    [5, 1, 669],      [5, 12, 680],
    	[5, 27, 695],     [5, 41, 709],     [5, 51, 719],     [5, 67, 735],
    	[5, 82, 750],     [5, 97, 765],     [5, 109, 777],    [6, 13, 801],
    	[6, 36, 824],     [6, 59, 847],     [6, 74, 862],     [6, 95, 883],
    	[6, 111, 899],    [6, 127, 915],    [6, 141, 929],    [6, 151, 939],
    	[7, 1, 954],      [7, 31, 984],     [7, 47, 1000],    [7, 65, 1018],
    	[7, 88, 1041],    [7, 117, 1070],   [7, 142, 1095],   [7, 156, 1109],
    	[7, 171, 1124],   [7, 189, 1142],   [8, 1, 1160],     [8, 22, 1181],
    	[8, 41, 1200],    [8, 61, 1220],    [9, 1, 1235],     [9, 19, 1253],
    	[9, 34, 1268],    [9, 46, 1280],    [9, 60, 1294],    [9, 75, 1309],
    	[9, 93, 1327],    [9, 111, 1345],   [9, 122, 1356],   [10, 11, 1374],
    	[10, 26, 1389],   [10, 53, 1416],   [10, 71, 1434],   [10, 90, 1453],
    	[11, 6, 1478],    [11, 24, 1496],   [11, 41, 1513],   [11, 61, 1533],
    	[11, 84, 1556],   [11, 108, 1580],  [12, 7, 1602],    [12, 30, 1625],
    	[12, 53, 1648],   [12, 77, 1672],   [12, 101, 1696],  [13, 5, 1711],
    	[13, 19, 1725],   [13, 35, 1741],   [14, 10, 1759],   [14, 28, 1777],
    	[15, 1, 1802],    [15, 50, 1851],   [16, 1, 1901],    [16, 30, 1930],
    	[16, 51, 1951],   [16, 75, 1975],   [16, 90, 1990],   [16, 111, 2011],
    	[17, 1, 2029],    [17, 23, 2051],   [17, 50, 2078],   [17, 70, 2098],
    	[17, 99, 2127],   [18, 17, 2156],   [18, 32, 2171],   [18, 51, 2190],
    	[18, 75, 2214],   [18, 99, 2238],   [19, 22, 2271],   [19, 59, 2308],
    	[20, 1, 2348],    [20, 55, 2402],   [20, 83, 2430],   [20, 111, 2458],
    	[21, 1, 2483],    [21, 29, 2511],   [21, 51, 2533],   [21, 83, 2565],
    	[22, 1, 2595],    [22, 19, 2613],   [22, 38, 2632],   [22, 60, 2654],
    	[23, 1, 2673],    [23, 36, 2708],   [23, 75, 2747],   [24, 1, 2791],
    	[24, 21, 2811],   [24, 35, 2825],   [24, 53, 2843],   [25, 1, 2855],
    	[25, 21, 2875],   [25, 53, 2907],   [26, 1, 2932],    [26, 52, 2983],
    	[26, 111, 3042],  [26, 181, 3112],  [27, 1, 3159],    [27, 27, 3185],
    	[27, 56, 3214],   [27, 82, 3240],   [28, 12, 3263],   [28, 29, 3280],
    	[28, 51, 3302],   [28, 76, 3327],   [29, 1, 3340],    [29, 26, 3365],
    	[29, 46, 3385],   [30, 1, 3409],    [30, 31, 3439],   [30, 54, 3462],
    	[31, 22, 3490],   [32, 11, 3513],   [33, 1, 3533],    [33, 18, 3550],
    	[33, 31, 3563],   [33, 51, 3583],   [33, 60, 3592],   [34, 10, 3615],
    	[34, 24, 3629],   [34, 46, 3651],   [35, 15, 3674],   [35, 41, 3700],
    	[36, 28, 3732],   [36, 60, 3764],   [37, 22, 3809],   [37, 83, 3870],
    	[37, 145, 3932],  [38, 21, 3990],   [38, 52, 4021],   [39, 8, 4065],
    	[39, 32, 4089],   [39, 53, 4110],   [40, 1, 4133],    [40, 21, 4153],
    	[40, 41, 4173],   [40, 66, 4198],   [41, 9, 4226],    [41, 25, 4242],
    	[41, 47, 4264],   [42, 13, 4284],   [42, 27, 4298],   [42, 51, 4322],
    	[43, 24, 4348],   [43, 57, 4381],   [44, 17, 4430],   [45, 12, 4484],
    	[46, 1, 4510],    [46, 21, 4530],   [47, 10, 4554],   [47, 33, 4577],
    	[48, 18, 4600],   [49, 1, 4612],    [49, 14, 4625],   [50, 27, 4656],
    	[51, 31, 4705],   [52, 24, 4758],   [53, 26, 4809],   [54, 9, 4854],
    	[55, 1, 4901],    [56, 1, 4979],    [56, 75, 5053],   [57, 16, 5090],
    	[58, 1, 5104],    [58, 14, 5117],   [59, 11, 5136],   [60, 7, 5156],
    	[62, 1, 5177],    [63, 4, 5191],    [65, 1, 5217],    [66, 1, 5229],
    	[67, 1, 5241],    [68, 1, 5271],    [69, 1, 5323],    [70, 19, 5393],
    	[72, 1, 5447],    [73, 20, 5494],   [75, 1, 5551],    [76, 19, 5609],
    	[78, 1, 5672],    [80, 1, 5758],    [82, 1, 5829],    [84, 1, 5884],
    	[87, 1, 5948],    [90, 1, 6023],    [94, 1, 6090],    [100, 9, 6154],
    	[115,1,6236] //fake index
    ];

    //------------------ Page Data ---------------------
    const Page = [
    	// start from [suraNumber, ayaNumberInSura, ayaNumberInQuran]
    	[1, 1, 0],       [2, 1, 7],       [2, 6, 12],      [2, 17, 23],     [2, 25, 31],     [2, 30, 36],
    	[2, 38, 44],     [2, 49, 55],     [2, 58, 64],     [2, 62, 68],     [2, 70, 76],     [2, 77, 83],
    	[2, 84, 90],     [2, 89, 95],     [2, 94, 100],    [2, 102, 108],   [2, 106, 112],   [2, 113, 119],
    	[2, 120, 126],   [2, 127, 133],   [2, 135, 141],   [2, 142, 148],   [2, 146, 152],   [2, 154, 160],
    	[2, 164, 170],   [2, 170, 176],   [2, 177, 183],   [2, 182, 188],   [2, 187, 193],   [2, 191, 197],
    	[2, 197, 203],   [2, 203, 209],   [2, 211, 217],   [2, 216, 222],   [2, 220, 226],   [2, 225, 231],
    	[2, 231, 237],   [2, 234, 240],   [2, 238, 244],   [2, 246, 252],   [2, 249, 255],   [2, 253, 259],
    	[2, 257, 263],   [2, 260, 266],   [2, 265, 271],   [2, 270, 276],   [2, 275, 281],   [2, 282, 288],
    	[2, 283, 289],   [3, 1, 293],     [3, 10, 302],    [3, 16, 308],    [3, 23, 315],    [3, 30, 322],
    	[3, 38, 330],    [3, 46, 338],    [3, 53, 345],    [3, 62, 354],    [3, 71, 363],    [3, 78, 370],
    	[3, 84, 376],    [3, 92, 384],    [3, 101, 393],   [3, 109, 401],   [3, 116, 408],   [3, 122, 414],
    	[3, 133, 425],   [3, 141, 433],   [3, 149, 441],   [3, 154, 446],   [3, 158, 450],   [3, 166, 458],
    	[3, 174, 466],   [3, 181, 473],   [3, 187, 479],   [3, 195, 487],   [4, 1, 493],     [4, 7, 499],
    	[4, 12, 504],    [4, 15, 507],    [4, 20, 512],    [4, 24, 516],    [4, 27, 519],    [4, 34, 526],
    	[4, 38, 530],    [4, 45, 537],    [4, 52, 544],    [4, 60, 552],    [4, 66, 558],    [4, 75, 567],
    	[4, 80, 572],    [4, 87, 579],    [4, 92, 584],    [4, 95, 587],    [4, 102, 594],   [4, 106, 598],
    	[4, 114, 606],   [4, 122, 614],   [4, 128, 620],   [4, 135, 627],   [4, 141, 633],   [4, 148, 640],
    	[4, 155, 647],   [4, 163, 655],   [4, 171, 663],   [4, 176, 668],   [5, 3, 671],     [5, 6, 674],
    	[5, 10, 678],    [5, 14, 682],    [5, 18, 686],    [5, 24, 692],    [5, 32, 700],    [5, 37, 705],
    	[5, 42, 710],    [5, 46, 714],    [5, 51, 719],    [5, 58, 726],    [5, 65, 733],    [5, 71, 739],
    	[5, 77, 745],    [5, 83, 751],    [5, 90, 758],    [5, 96, 764],    [5, 104, 772],   [5, 109, 777],
    	[5, 114, 782],   [6, 1, 789],     [6, 9, 797],     [6, 19, 807],    [6, 28, 816],    [6, 36, 824],
    	[6, 45, 833],    [6, 53, 841],    [6, 60, 848],    [6, 69, 857],    [6, 74, 862],    [6, 82, 870],
    	[6, 91, 879],    [6, 95, 883],    [6, 102, 890],   [6, 111, 899],   [6, 119, 907],   [6, 125, 913],
    	[6, 132, 920],   [6, 138, 926],   [6, 143, 931],   [6, 147, 935],   [6, 152, 940],   [6, 158, 946],
    	[7, 1, 954],     [7, 12, 965],    [7, 23, 976],    [7, 31, 984],    [7, 38, 991],    [7, 44, 997],
    	[7, 52, 1005],   [7, 58, 1011],   [7, 68, 1021],   [7, 74, 1027],   [7, 82, 1035],   [7, 88, 1041],
    	[7, 96, 1049],   [7, 105, 1058],  [7, 121, 1074],  [7, 131, 1084],  [7, 138, 1091],  [7, 144, 1097],
    	[7, 150, 1103],  [7, 156, 1109],  [7, 160, 1113],  [7, 164, 1117],  [7, 171, 1124],  [7, 179, 1132],
    	[7, 188, 1141],  [7, 196, 1149],  [8, 1, 1160],    [8, 9, 1168],    [8, 17, 1176],   [8, 26, 1185],
    	[8, 34, 1193],   [8, 41, 1200],   [8, 46, 1205],   [8, 53, 1212],   [8, 62, 1221],   [8, 70, 1229],
    	[9, 1, 1235],    [9, 7, 1241],    [9, 14, 1248],   [9, 21, 1255],   [9, 27, 1261],   [9, 32, 1266],
    	[9, 37, 1271],   [9, 41, 1275],   [9, 48, 1282],   [9, 55, 1289],   [9, 62, 1296],   [9, 69, 1303],
    	[9, 73, 1307],   [9, 80, 1314],   [9, 87, 1321],   [9, 94, 1328],   [9, 100, 1334],  [9, 107, 1341],
    	[9, 112, 1346],  [9, 118, 1352],  [9, 123, 1357],  [10, 1, 1364],   [10, 7, 1370],   [10, 15, 1378],
    	[10, 21, 1384],  [10, 26, 1389],  [10, 34, 1397],  [10, 43, 1406],  [10, 54, 1417],  [10, 62, 1425],
    	[10, 71, 1434],  [10, 79, 1442],  [10, 89, 1452],  [10, 98, 1461],  [10, 107, 1470], [11, 6, 1478],
    	[11, 13, 1485],  [11, 20, 1492],  [11, 29, 1501],  [11, 38, 1510],  [11, 46, 1518],  [11, 54, 1526],
    	[11, 63, 1535],  [11, 72, 1544],  [11, 82, 1554],  [11, 89, 1561],  [11, 98, 1570],  [11, 109, 1581],
    	[11, 118, 1590], [12, 5, 1600],   [12, 15, 1610],  [12, 23, 1618],  [12, 31, 1626],  [12, 38, 1633],
    	[12, 44, 1639],  [12, 53, 1648],  [12, 64, 1659],  [12, 70, 1665],  [12, 79, 1674],  [12, 87, 1682],
    	[12, 96, 1691],  [12, 104, 1699], [13, 1, 1707],   [13, 6, 1712],   [13, 14, 1720],  [13, 19, 1725],
    	[13, 29, 1735],  [13, 35, 1741],  [13, 43, 1749],  [14, 6, 1755],   [14, 11, 1760],  [14, 19, 1768],
    	[14, 25, 1774],  [14, 34, 1783],  [14, 43, 1792],  [15, 1, 1802],   [15, 16, 1817],  [15, 32, 1833],
    	[15, 52, 1853],  [15, 71, 1872],  [15, 91, 1892],  [16, 7, 1907],   [16, 15, 1915],  [16, 27, 1927],
    	[16, 35, 1935],  [16, 43, 1943],  [16, 55, 1955],  [16, 65, 1965],  [16, 73, 1973],  [16, 80, 1980],
    	[16, 88, 1988],  [16, 94, 1994],  [16, 103, 2003], [16, 111, 2011], [16, 119, 2019], [17, 1, 2029],
    	[17, 8, 2036],   [17, 18, 2046],  [17, 28, 2056],  [17, 39, 2067],  [17, 50, 2078],  [17, 59, 2087],
    	[17, 67, 2095],  [17, 76, 2104],  [17, 87, 2115],  [17, 97, 2125],  [17, 105, 2133], [18, 5, 2144],
    	[18, 16, 2155],  [18, 21, 2160],  [18, 28, 2167],  [18, 35, 2174],  [18, 46, 2185],  [18, 54, 2193],
    	[18, 62, 2201],  [18, 75, 2214],  [18, 84, 2223],  [18, 98, 2237],  [19, 1, 2250],   [19, 12, 2261],
    	[19, 26, 2275],  [19, 39, 2288],  [19, 52, 2301],  [19, 65, 2314],  [19, 77, 2326],  [19, 96, 2345],
    	[20, 13, 2360],  [20, 38, 2385],  [20, 52, 2399],  [20, 65, 2412],  [20, 77, 2424],  [20, 88, 2435],
    	[20, 99, 2446],  [20, 114, 2461], [20, 126, 2473], [21, 1, 2483],   [21, 11, 2493],  [21, 25, 2507],
    	[21, 36, 2518],  [21, 45, 2527],  [21, 58, 2540],  [21, 73, 2555],  [21, 82, 2564],  [21, 91, 2573],
    	[21, 102, 2584], [22, 1, 2595],   [22, 6, 2600],   [22, 16, 2610],  [22, 24, 2618],  [22, 31, 2625],
    	[22, 39, 2633],  [22, 47, 2641],  [22, 56, 2650],  [22, 65, 2659],  [22, 73, 2667],  [23, 1, 2673],
    	[23, 18, 2690],  [23, 28, 2700],  [23, 43, 2715],  [23, 60, 2732],  [23, 75, 2747],  [23, 90, 2762],
    	[23, 105, 2777], [24, 1, 2791],   [24, 11, 2801],  [24, 21, 2811],  [24, 28, 2818],  [24, 32, 2822],
    	[24, 37, 2827],  [24, 44, 2834],  [24, 54, 2844],  [24, 59, 2849],  [24, 62, 2852],  [25, 3, 2857],
    	[25, 12, 2866],  [25, 21, 2875],  [25, 33, 2887],  [25, 44, 2898],  [25, 56, 2910],  [25, 68, 2922],
    	[26, 1, 2932],   [26, 20, 2951],  [26, 40, 2971],  [26, 61, 2992],  [26, 84, 3015],  [26, 112, 3043],
    	[26, 137, 3068], [26, 160, 3091], [26, 184, 3115], [26, 207, 3138], [27, 1, 3159],   [27, 14, 3172],
    	[27, 23, 3181],  [27, 36, 3194],  [27, 45, 3203],  [27, 56, 3214],  [27, 64, 3222],  [27, 77, 3235],
    	[27, 89, 3247],  [28, 6, 3257],   [28, 14, 3265],  [28, 22, 3273],  [28, 29, 3280],  [28, 36, 3287],
    	[28, 44, 3295],  [28, 51, 3302],  [28, 60, 3311],  [28, 71, 3322],  [28, 78, 3329],  [28, 85, 3336],
    	[29, 7, 3346],   [29, 15, 3354],  [29, 24, 3363],  [29, 31, 3370],  [29, 39, 3378],  [29, 46, 3385],
    	[29, 53, 3392],  [29, 64, 3403],  [30, 6, 3414],   [30, 16, 3424],  [30, 25, 3433],  [30, 33, 3441],
    	[30, 42, 3450],  [30, 51, 3459],  [31, 1, 3469],   [31, 12, 3480],  [31, 20, 3488],  [31, 29, 3497],
    	[32, 1, 3503],   [32, 12, 3514],  [32, 21, 3523],  [33, 1, 3533],   [33, 7, 3539],   [33, 16, 3548],
    	[33, 23, 3555],  [33, 31, 3563],  [33, 36, 3568],  [33, 44, 3576],  [33, 51, 3583],  [33, 55, 3587],
    	[33, 63, 3595],  [34, 1, 3606],   [34, 8, 3613],   [34, 15, 3620],  [34, 23, 3628],  [34, 32, 3637],
    	[34, 40, 3645],  [34, 49, 3654],  [35, 4, 3663],   [35, 12, 3671],  [35, 19, 3678],  [35, 31, 3690],
    	[35, 39, 3698],  [35, 45, 3704],  [36, 13, 3717],  [36, 28, 3732],  [36, 41, 3745],  [36, 55, 3759],
    	[36, 71, 3775],  [37, 1, 3788],   [37, 25, 3812],  [37, 52, 3839],  [37, 77, 3864],  [37, 103, 3890],
    	[37, 127, 3914], [37, 154, 3941], [38, 1, 3970],   [38, 17, 3986],  [38, 27, 3996],  [38, 43, 4012],
    	[38, 62, 4031],  [38, 84, 4053],  [39, 6, 4063],   [39, 11, 4068],  [39, 22, 4079],  [39, 32, 4089],
    	[39, 41, 4098],  [39, 48, 4105],  [39, 57, 4114],  [39, 68, 4125],  [39, 75, 4132],  [40, 8, 4140],
    	[40, 17, 4149],  [40, 26, 4158],  [40, 34, 4166],  [40, 41, 4173],  [40, 50, 4182],  [40, 59, 4191],
    	[40, 67, 4199],  [40, 78, 4210],  [41, 1, 4218],   [41, 12, 4229],  [41, 21, 4238],  [41, 30, 4247],
    	[41, 39, 4256],  [41, 47, 4264],  [42, 1, 4272],   [42, 11, 4282],  [42, 16, 4287],  [42, 23, 4294],
    	[42, 32, 4303],  [42, 45, 4316],  [42, 52, 4323],  [43, 11, 4335],  [43, 23, 4347],  [43, 34, 4358],
    	[43, 48, 4372],  [43, 61, 4385],  [43, 74, 4398],  [44, 1, 4414],   [44, 19, 4432],  [44, 40, 4453],
    	[45, 1, 4473],   [45, 14, 4486],  [45, 23, 4495],  [45, 33, 4505],  [46, 6, 4515],   [46, 15, 4524],
    	[46, 21, 4530],  [46, 29, 4538],  [47, 1, 4545],   [47, 12, 4556],  [47, 20, 4564],  [47, 30, 4574],
    	[48, 1, 4583],   [48, 10, 4592],  [48, 16, 4598],  [48, 24, 4606],  [48, 29, 4611],  [49, 5, 4616],
    	[49, 12, 4623],  [50, 1, 4630],   [50, 16, 4645],  [50, 36, 4665],  [51, 7, 4681],   [51, 31, 4705],
    	[51, 52, 4726],  [52, 15, 4749],  [52, 32, 4766],  [53, 1, 4784],   [53, 27, 4810],  [53, 45, 4828],
    	[54, 7, 4852],   [54, 28, 4873],  [54, 50, 4895],  [55, 17, 4917],  [55, 41, 4941],  [55, 68, 4968],
    	[56, 17, 4995],  [56, 51, 5029],  [56, 77, 5055],  [57, 4, 5078],   [57, 12, 5086],  [57, 19, 5093],
    	[57, 25, 5099],  [58, 1, 5104],   [58, 7, 5110],   [58, 12, 5115],  [58, 22, 5125],  [59, 4, 5129],
    	[59, 10, 5135],  [59, 17, 5142],  [60, 1, 5150],   [60, 6, 5155],   [60, 12, 5161],  [61, 6, 5168],
    	[62, 1, 5177],   [62, 9, 5185],   [63, 5, 5192],   [64, 1, 5199],   [64, 10, 5208],  [65, 1, 5217],
    	[65, 6, 5222],   [66, 1, 5229],   [66, 8, 5236],   [67, 1, 5241],   [67, 13, 5253],  [67, 27, 5267],
    	[68, 16, 5286],  [68, 43, 5313],  [69, 9, 5331],   [69, 35, 5357],  [70, 11, 5385],  [70, 40, 5414],
    	[71, 11, 5429],  [72, 1, 5447],   [72, 14, 5460],  [73, 1, 5475],   [73, 20, 5494],  [74, 18, 5512],
    	[74, 48, 5542],  [75, 20, 5570],  [76, 6, 5596],   [76, 26, 5616],  [77, 20, 5641],  [78, 1, 5672],
    	[78, 31, 5702],  [79, 16, 5727],  [80, 1, 5758],   [81, 1, 5800],   [82, 1, 5829],   [83, 7, 5854],
    	[83, 35, 5882],  [85, 1, 5909],   [86, 1, 5931],   [87, 16, 5963],  [89, 1, 5993],   [89, 24, 6016],
    	[91, 1, 6043],   [92, 15, 6072],  [95, 1, 6098],   [97, 1, 6125],   [98, 8, 6137],   [100, 10, 6155],
    	[103, 1, 6176],  [106, 1, 6193],  [109, 1, 6207],  [112, 1, 6221],
    	[115,1,6236] //fake index
    ];

    //------------------ Sajda Data ---------------------
    const Sajda = [
    	// [suraNumber, ayaNumberInSura, type, ayaNumberInQuran]
    	[7 , 206, 'recommended', 1159],
    	[13, 15,  'recommended', 1721],
    	[16, 50,  'recommended', 1950],
    	[17, 109, 'recommended', 2137],
    	[19, 58,  'recommended', 2307],
    	[22, 18,  'recommended', 2612],
    	[22, 77,  'recommended', 2671],
    	[25, 60,  'recommended', 2914],
    	[27, 26,  'recommended', 3184],
    	[32, 15,  'obligatory',  3517],
    	[38, 24,  'recommended', 3993],
    	[41, 38,  'obligatory',  4255],
    	[53, 62,  'obligatory',  4845],
    	[84, 21,  'recommended', 5904],
    	[96, 19,  'obligatory',  6124],
    ];

    	//--------------------------------------------------
    const QuranData = {
    	totalAyasNumber: 6236,
    	totalSurasNumber: 114,
    	totalPagesNumber: 604,
    	totalJuzsNumber: 30,
    	totalHizbsNumber: 120
    };

    //--------------------------------------------------
    const translatesList = {
    	'am_sadiq': 'ሳዲቅ & ሳኒ ሐቢብ',
    	'ar_jalalayn': 'تفسير الجلالين',
    	'ar_muyassar': 'تفسير المیسر',
    	'sq_nahi': 'Efendi Nahi',
    	'sq_mehdiu': 'Feti Mehdiu',
    	'sq_ahmeti': 'Sherif Ahmeti',
    	'ber_mensur': 'At Mensur',
    	'az_mammadaliyev': 'Məmmədəliyev & Bünyadov',
    	'az_musayev': 'Musayev',
    	'bn_hoque': 'জহুরুল হক',
    	'bn_bengali': 'মুহিউদ্দীন খান',
    	'bs_korkut': 'Korkut',
    	'bs_mlivo': 'Mlivo',
    	'bg_theophanov': 'Теофанов',
    	'zh_jian': 'Ma Jian',
    	'zh_majian': 'Ma Jian - Traditional',
    	'cs_hrbek': 'Hrbek',
    	'cs_nykl': 'Nykl',
    	'dv_divehi': 'ދިވެހި',
    	'nl_keyzer': 'Keyzer',
    	'nl_leemhuis': 'Leemhuis',
    	'nl_siregar': 'Siregar',
    	'en_ahmedali': 'Ahmed Ali',
    	'en_ahmedraza': 'Ahmed Raza Khan',
    	'en_arberry': 'Arberry',
    	'en_asad': 'Asad',
    	'en_daryabadi': 'Daryabadi',
    	'en_hilali': 'Hilali & Khan',
    	'en_itani': 'Itani',
    	'en_maududi': 'Maududi',
    	'en_mubarakpuri': 'Mubarakpuri',
    	'en_pickthall': 'Pickthall',
    	'en_qarai': 'Qarai',
    	'en_qaribullah': 'Qaribullah & Darwish',
    	'en_sahih': 'Saheeh International',
    	'en_sarwar': 'Sarwar',
    	'en_shakir': 'Shakir',
    	'en_wahiduddin': 'Wahiduddin Khan',
    	'en_yusufali': 'Yusuf Ali',
    	'en_transliteration': 'Transliteration',
    	'fr_hamidullah': 'Hamidullah',
    	'de_aburida': 'Abu Rida',
    	'de_bubenheim': 'Bubenheim & Elyas',
    	'de_khoury': 'Khoury',
    	'de_zaidan': 'Zaidan',
    	'ha_gumi': 'Gumi',
    	'hi_farooq': 'फ़ारूक़ ख़ान & अहमद',
    	'hi_hindi': 'फ़ारूक़ ख़ान & नदवी',
    	'id_indonesian': 'Bahasa Indonesia',
    	'id_jalalayn': 'Tafsir Jalalayn',
    	'id_muntakhab': 'Quraish Shihab',
    	'it_piccardo': 'Piccardo',
    	'ja_japanese': 'Japanese',
    	'ku_asan': 'ته‌فسیری ئاسان',
    	'ko_korean': 'Korean',
    	'ms_basmeih': 'Basmeih',
    	'ml_abdulhameed': 'അബ്ദുല്‍ ഹമീദ് & പറപ്പൂര്‍',
    	'ml_karakunnu': 'കാരകുന്ന് & എളയാവൂര്',
    	'no_berg': 'Einar Berg',
    	'ps_abdulwali': 'عبدالولي',
    	'fa_ansarian': 'انصاریان',
    	'fa_ayati': 'آیتی',
    	'fa_bahrampour': 'بهرام پور',
    	'fa_gharaati': 'قرائتی',
    	'fa_ghomshei': 'الهی قمشه‌ای',
    	'fa_khorramdel': 'خرمدل',
    	'fa_khorramshahi': 'خرمشاهی',
    	'fa_sadeqi': 'صادقی تهرانی',
    	'fa_fooladvand': 'فولادوند',
    	'fa_mojtabavi': 'مجتبوی',
    	'fa_moezzi': 'معزی',
    	'fa_makarem': 'مکارم شیرازی',
    	'pl_bielawskiego': 'Bielawskiego',
    	'pt_elhayek': 'El-Hayek',
    	'ro_grigore': 'Grigore',
    	'ru_abuadel': 'Абу Адель',
    	'ru_muntahab': 'Аль-Мунтахаб',
    	'ru_krachkovsky': 'Крачковский',
    	'ru_kuliev': 'Кулиев',
    	'ru_osmanov': 'Османов',
    	'ru_porokhova': 'Порохова',
    	'ru_sablukov': 'Саблуков',
    	'sd_amroti': 'امروٽي',
    	'so_abduh': 'Abduh',
    	'es_asad': 'Asad',
    	'es_bornez': 'Bornez',
    	'es_cortes': 'Cortes',
    	'es_garcia': 'Garcia',
    	'sw_barwani': 'Al-Barwani',
    	'sv_bernstrom': 'Bernström',
    	'tg_ayati': 'Оятӣ',
    	'ta_tamil': 'தமிழ்',
    	'tt_nugman': 'Yakub Ibn Nugman',
    	'th_thai': 'ภาษาไทย',
    	'tr_golpinarli': 'Abdulbakî Gölpınarlı',
    	'tr_bulac': 'Alİ Bulaç',
    	'tr_transliteration': 'Çeviriyazı',
    	'tr_diyanet': 'Diyanet İşleri',
    	'tr_vakfi': 'Diyanet Vakfı',
    	'tr_yuksel': 'Edip Yüksel',
    	'tr_yazir': 'Elmalılı Hamdi Yazır',
    	'tr_ozturk': 'Öztürk',
    	'tr_yildirim': 'Suat Yıldırım',
    	'tr_ates': 'Süleyman Ateş',
    	'ur_maududi': 'ابوالاعلی مودودی',
    	'ur_kanzuliman': 'احمد رضا خان',
    	'ur_ahmedali': 'احمد علی',
    	'ur_jalandhry': 'جالندہری',
    	'ur_qadri': 'طاہر القادری',
    	'ur_jawadi': 'علامہ جوادی',
    	'ur_junagarhi': 'محمد جوناگڑھی',
    	'ur_najafi': 'محمد حسین نجفی',
    	'ug_saleh': 'محمد صالح',
    	'uz_sodik': 'Мухаммад Содик'
    };

    const languagesList = {
    	ber: 'Amazigh',
    	sq: 'Albanian',
    	am: 'Amharic',
    	ar: 'Arabic',
    	az: 'Azerbaijani',
    	bn: 'Bengali',
    	bs: 'Bosnian',
    	bg: 'Bulgarian',
    	cs: 'Czech',
    	dv: 'Divehi',
    	nl: 'Dutch',
    	en: 'English',
    	fr: 'French',
    	de: 'German',
    	ha: 'Hausa',
    	hi: 'Hindi',
    	id: 'Indonesian',
    	it: 'Italian',
    	ja: 'Japanese',
    	ko: 'Korean',
    	ku: 'Kurdish',
    	ms: 'Malay',
    	ml: 'Malayalam',
    	no: 'Norwegian',
    	ps: 'Pashto',
    	fa: 'Persian',
    	pl: 'Polish',
    	pt: 'Portuguese',
    	ro: 'Romanian',
    	ru: 'Russian',
    	sd: 'Sindhi',
    	so: 'Somali',
    	es: 'Spanish',
    	sw: 'Swahili',
    	sv: 'Swedish',
    	tg: 'Tajik',
    	ta: 'Tamil',
    	tt: 'Tatar',
    	th: 'Thai',
    	tr: 'Turkish',
    	ur: 'Urdu',
    	ug: 'Uyghur',
    	uz: 'Uzbek',
    	zh: 'Chinese'
    };

    const rtlLangs = ['ar', 'fa', 'ur', 'ps', 'ug', 'sd', 'ku', 'dv'];

    function getPageNumber(aya) {
    	if (aya >= 6221) return 603
    	if (aya < 7) return 0
    	for (let i = 0; i < Page.length; i++) {
    		if (Page[i][2] <= aya && aya < Page[i+1][2])
    			return i
    	}
    	return 0
    }

    function getSuraNumber(aya) {
    	if (aya >= 6230) return 113
    	if (aya < 7) return 0
    	for (let i = 0; i < Sura.length; i++) {
    		if (Sura[i][0] <= aya && aya < Sura[i+1][0])
    			return i
    	}
    	return 0
    }

    function getJuzNumber(aya) {
    	if (aya >= 5672) return 29
    	if (aya < 148) return 0
    	for (let i = 0; i <= 29; i++) {
    		if (Juz[i][2] <= aya && aya < Juz[i+1][2])
    			return i
    	}
    	return 0
    }

    function getHizbNumber(aya) {
    	if (aya >= 6154) return 239
    	if (aya < 32) return 0
    	for (let i = 0; i <= 239; i++) {
    		if (Hizb[i][2] <= aya && aya < Hizb[i+1][2])
    			return i
    	}
    	return 0
    }

    var QuranData$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Sura: Sura,
        Juz: Juz,
        Hizb: Hizb,
        Page: Page,
        Sajda: Sajda,
        QuranData: QuranData,
        translatesList: translatesList,
        languagesList: languagesList,
        rtlLangs: rtlLangs,
        getPageNumber: getPageNumber,
        getSuraNumber: getSuraNumber,
        getJuzNumber: getJuzNumber,
        getHizbNumber: getHizbNumber
    });

    const sideBarStatus = writable({
        informations: true,
        settings: false,
        about: false,
        help: false,
        active: true
    });

    const allKeys = ['darktheme', 'aya', 'text', 'showtext', 'showtranslate', 'translate', 'translatesize', 'textsize'];
    for (const key of allKeys) {
        if ((localStorage.getItem(key) !== null)) {
            try {
                JSON.parse(localStorage.getItem(key));
            } catch {
                localStorage.setItem(key, JSON.stringify(localStorage.getItem(key), null, 2));
            }
        }
    }

    function localStore(key, initial, condition) {

        const toString = (value) => JSON.stringify(value, null, 2);
        const toObj = (value) => JSON.parse(value);
        
        if (condition) {
            localStorage.setItem(key, toString(initial));
        }
        
        const saved = toObj(localStorage.getItem(key));

        const { subscribe, set, update } = writable(saved);

        return {
            subscribe,
            set: (value) => {
                localStorage.setItem(key, toString(value));
                return set(value)
            },
            update
        }
    }

    const ayaNumberInQuran = localStore('aya', 0,
        (localStorage.getItem('aya') === null      ||
        isNaN(Number(localStorage.getItem('aya'))) ||
        Number(localStorage.getItem('aya')) < 0    ||
        Number(localStorage.getItem('aya')) > 6235));

    const suraNumber = derived(
        ayaNumberInQuran,
        $ayaNumberInQuran => getSuraNumber(Number($ayaNumberInQuran))
    );

    const juzNumber = derived(
        ayaNumberInQuran,
        $ayaNumberInQuran => getJuzNumber(Number($ayaNumberInQuran))
    );

    const hizbNumber = derived(
        ayaNumberInQuran,
        $ayaNumberInQuran => getHizbNumber(Number($ayaNumberInQuran))
    );

    const pageNumber = derived(
        ayaNumberInQuran,
        $ayaNumberInQuran => getPageNumber(Number($ayaNumberInQuran))
    );

    const availableTexts = ['quran-simple','quran-simple-plain','quran-simple-min','quran-simple-clean','quran-uthmani','quran-uthmani-min'];
    const textSelected = localStore('text', 'quran-simple', (
        localStorage.getItem('text') === null      ||
        !availableTexts.includes(JSON.parse(localStorage.getItem('text')))
    ));

    const availableTranslates = ['am_sadiq','ar_jalalayn','ar_muyassar','az_mammadaliyev','az_musayev','ber_mensur','bg_theophanov','bn_bengali','bn_hoque','bs_mlivo','de_aburida','de_zaidan','dv_divehi','en_ahmedali','en_ahmedraza','en_arberry','en_daryabadi','en_itani','en_maududi','en_pickthall','en_qarai','en_qaribullah','en_sahih','en_sarwar','en_transliteration','en_wahiduddin','en_yusufali','es_bornez','es_cortes','es_garcia','fa_ansarian','fa_ayati','fa_gharaati','fa_ghomshei','fa_khorramshahi','fa_makarem','fa_moezzi','fa_mojtabavi','fa_sadeqi','fr_hamidullah','hi_farooq','hi_hindi','id_indonesian','id_jalalayn','id_muntakhab','it_piccardo','ja_japanese','ko_korean','ku_asan','ml_abdulhameed','ml_karakunnu','ms_basmeih','nl_keyzer','nl_leemhuis','nl_siregar','no_berg','ps_abdulwali','ro_grigore','ru_abuadel','ru_krachkovsky','ru_kuliev','ru_muntahab','ru_osmanov','ru_sablukov','sd_amroti','so_abduh','sq_mehdiu','sq_nahi','sv_bernstrom','sw_barwani','ta_tamil','tg_ayati','tr_ates','tr_bulac','tr_ozturk','tr_transliteration','tr_vakfi','tr_yazir','tr_yildirim','tt_nugman','ur_ahmedali','ur_jalandhry','ur_jawadi','ur_junagarhi','ur_maududi','ur_najafi','ur_qadri','uz_sodik'];
    const translateSelected = localStore('translate', 'fa_ghomshei', (
        localStorage.getItem('translate') === null ||
        !availableTranslates.includes(JSON.parse(localStorage.getItem('translate')))
    ));

    const showOnlyText = localStore('showtext', false, (
        localStorage.getItem('showtext') === null  ||
        ![true, false].includes(JSON.parse(localStorage.getItem('showtext')))
    ));

    const showOnlyTranslate = localStore('showtranslate', false, (
        localStorage.getItem('showtranslate') === null ||
        ![true, false].includes(JSON.parse(localStorage.getItem('showtranslate')))
    ));

    const darkTheme = localStore('darktheme', false, (
        localStorage.getItem('darktheme') === null     ||
        ![true, false].includes(JSON.parse(localStorage.getItem('darktheme')))
    ));

    const textFontSize = localStore('textsize', 30, (
        localStorage.getItem('textsize') === null      ||
        typeof JSON.parse(localStorage.getItem('textsize')) !== "number"
    ));

    const translateFontSize = localStore('translatesize', 22, (
        localStorage.getItem('translatesize') === null ||
        typeof JSON.parse(localStorage.getItem('translatesize')) !== "number"
    ));

    /* node_modules/carbon-icons-svelte/lib/TableOfContents32/TableOfContents32.svelte generated by Svelte v3.37.0 */

    const file$m = "node_modules/carbon-icons-svelte/lib/TableOfContents32/TableOfContents32.svelte";

    // (39:4) {#if title}
    function create_if_block$c(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$m, 39, 6, 1121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block$7(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$7.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const default_slot_or_fallback = default_slot || fallback_block$7(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "TableOfContents32" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ width: "32" },
    		{ height: "32" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path, "d", "M4 6H22V8H4zM4 12H22V14H4zM4 18H22V20H4zM4 24H22V26H4zM26 6H28V8H26zM26 12H28V14H26zM26 18H28V20H26zM26 24H28V26H26z");
    			add_location(path, file$m, 36, 2, 955);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$m, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[14], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[15], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[16], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "TableOfContents32" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ width: "32" },
    				{ height: "32" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TableOfContents32", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(8, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(9, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(7, ariaLabel = $$props["aria-label"]);
    		$$invalidate(8, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 388) {
    			$$invalidate(9, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 992) {
    			$$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class TableOfContents32 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableOfContents32",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get class() {
    		throw new Error("<TableOfContents32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TableOfContents32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TableOfContents32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TableOfContents32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<TableOfContents32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<TableOfContents32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<TableOfContents32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<TableOfContents32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<TableOfContents32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<TableOfContents32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TableOfContents32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TableOfContents32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/Settings32/Settings32.svelte generated by Svelte v3.37.0 */

    const file$l = "node_modules/carbon-icons-svelte/lib/Settings32/Settings32.svelte";

    // (39:4) {#if title}
    function create_if_block$b(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$l, 39, 6, 2039);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block$6(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$6.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const default_slot_or_fallback = default_slot || fallback_block$6(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "Settings32" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ width: "32" },
    		{ height: "32" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path0, "d", "M27,16.76c0-.25,0-.5,0-.76s0-.51,0-.77l1.92-1.68A2,2,0,0,0,29.3,11L26.94,7a2,2,0,0,0-1.73-1,2,2,0,0,0-.64.1l-2.43.82a11.35,11.35,0,0,0-1.31-.75l-.51-2.52a2,2,0,0,0-2-1.61H13.64a2,2,0,0,0-2,1.61l-.51,2.52a11.48,11.48,0,0,0-1.32.75L7.43,6.06A2,2,0,0,0,6.79,6,2,2,0,0,0,5.06,7L2.7,11a2,2,0,0,0,.41,2.51L5,15.24c0,.25,0,.5,0,.76s0,.51,0,.77L3.11,18.45A2,2,0,0,0,2.7,21L5.06,25a2,2,0,0,0,1.73,1,2,2,0,0,0,.64-.1l2.43-.82a11.35,11.35,0,0,0,1.31.75l.51,2.52a2,2,0,0,0,2,1.61h4.72a2,2,0,0,0,2-1.61l.51-2.52a11.48,11.48,0,0,0,1.32-.75l2.42.82a2,2,0,0,0,.64.1,2,2,0,0,0,1.73-1L29.3,21a2,2,0,0,0-.41-2.51ZM25.21,24l-3.43-1.16a8.86,8.86,0,0,1-2.71,1.57L18.36,28H13.64l-.71-3.55a9.36,9.36,0,0,1-2.7-1.57L6.79,24,4.43,20l2.72-2.4a8.9,8.9,0,0,1,0-3.13L4.43,12,6.79,8l3.43,1.16a8.86,8.86,0,0,1,2.71-1.57L13.64,4h4.72l.71,3.55a9.36,9.36,0,0,1,2.7,1.57L25.21,8,27.57,12l-2.72,2.4a8.9,8.9,0,0,1,0,3.13L27.57,20Z");
    			add_location(path0, file$l, 36, 2, 948);
    			attr_dev(path1, "d", "M16,22a6,6,0,1,1,6-6A5.94,5.94,0,0,1,16,22Zm0-10a3.91,3.91,0,0,0-4,4,3.91,3.91,0,0,0,4,4,3.91,3.91,0,0,0,4-4A3.91,3.91,0,0,0,16,12Z");
    			add_location(path1, file$l, 36, 912, 1858);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$l, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[14], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[15], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[16], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "Settings32" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ width: "32" },
    				{ height: "32" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Settings32", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(8, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(9, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(7, ariaLabel = $$props["aria-label"]);
    		$$invalidate(8, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 388) {
    			$$invalidate(9, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 992) {
    			$$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class Settings32 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings32",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get class() {
    		throw new Error("<Settings32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Settings32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Settings32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Settings32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Settings32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Settings32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<Settings32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<Settings32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Settings32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Settings32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Settings32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Settings32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/Help32/Help32.svelte generated by Svelte v3.37.0 */

    const file$k = "node_modules/carbon-icons-svelte/lib/Help32/Help32.svelte";

    // (39:4) {#if title}
    function create_if_block$a(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$k, 39, 6, 1255);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$5.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let svg;
    	let path0;
    	let circle;
    	let path1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const default_slot_or_fallback = default_slot || fallback_block$5(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "Help32" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ width: "32" },
    		{ height: "32" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			circle = svg_element("circle");
    			path1 = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path0, "d", "M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z");
    			add_location(path0, file$k, 36, 2, 944);
    			attr_dev(circle, "cx", "16");
    			attr_dev(circle, "cy", "23.5");
    			attr_dev(circle, "r", "1.5");
    			add_location(circle, file$k, 36, 103, 1045);
    			attr_dev(path1, "d", "M17,8H15.5A4.49,4.49,0,0,0,11,12.5V13h2v-.5A2.5,2.5,0,0,1,15.5,10H17a2.5,2.5,0,0,1,0,5H15v4.5h2V17a4.5,4.5,0,0,0,0-9Z");
    			add_location(path1, file$k, 36, 146, 1088);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$k, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, circle);
    			append_dev(svg, path1);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[14], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[15], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[16], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "Help32" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ width: "32" },
    				{ height: "32" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Help32", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(8, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(9, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(7, ariaLabel = $$props["aria-label"]);
    		$$invalidate(8, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 388) {
    			$$invalidate(9, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 992) {
    			$$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class Help32 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Help32",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get class() {
    		throw new Error("<Help32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Help32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Help32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Help32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Help32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Help32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<Help32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<Help32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Help32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Help32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Help32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Help32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/Information32/Information32.svelte generated by Svelte v3.37.0 */

    const file$j = "node_modules/carbon-icons-svelte/lib/Information32/Information32.svelte";

    // (39:4) {#if title}
    function create_if_block$9(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$j, 39, 6, 1213);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$4.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const default_slot_or_fallback = default_slot || fallback_block$4(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "Information32" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ width: "32" },
    		{ height: "32" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path0, "d", "M17 22L17 14 13 14 13 16 15 16 15 22 12 22 12 24 20 24 20 22 17 22zM16 8a1.5 1.5 0 101.5 1.5A1.5 1.5 0 0016 8z");
    			add_location(path0, file$j, 36, 2, 951);
    			attr_dev(path1, "d", "M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z");
    			add_location(path1, file$j, 36, 130, 1079);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$j, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[14], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[15], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[16], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "Information32" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ width: "32" },
    				{ height: "32" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Information32", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(8, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(9, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(7, ariaLabel = $$props["aria-label"]);
    		$$invalidate(8, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 388) {
    			$$invalidate(9, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 992) {
    			$$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class Information32 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Information32",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get class() {
    		throw new Error("<Information32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Information32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Information32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Information32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Information32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Information32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<Information32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<Information32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Information32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Information32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Information32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Information32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte/components/SideNav.svelte generated by Svelte v3.37.0 */

    const { Object: Object_1 } = globals;
    const file$i = "src/svelte/components/SideNav.svelte";

    function create_fragment$i(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let tableofcontents32;
    	let t0;
    	let div1;
    	let settings32;
    	let t1;
    	let div5;
    	let div3;
    	let help32;
    	let t2;
    	let div4;
    	let information32;
    	let current;
    	let mounted;
    	let dispose;
    	tableofcontents32 = new TableOfContents32({ $$inline: true });
    	settings32 = new Settings32({ $$inline: true });
    	help32 = new Help32({ $$inline: true });
    	information32 = new Information32({ $$inline: true });

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(tableofcontents32.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(settings32.$$.fragment);
    			t1 = space();
    			div5 = element("div");
    			div3 = element("div");
    			create_component(help32.$$.fragment);
    			t2 = space();
    			div4 = element("div");
    			create_component(information32.$$.fragment);
    			attr_dev(div0, "class", "icon svelte-11m8is8");
    			toggle_class(div0, "active", /*$sideBarStatus*/ ctx[0].informations);
    			add_location(div0, file$i, 25, 8, 775);
    			attr_dev(div1, "class", "icon svelte-11m8is8");
    			toggle_class(div1, "active", /*$sideBarStatus*/ ctx[0].settings);
    			add_location(div1, file$i, 28, 8, 934);
    			attr_dev(div2, "class", "top");
    			add_location(div2, file$i, 24, 4, 749);
    			attr_dev(div3, "class", "icon svelte-11m8is8");
    			toggle_class(div3, "active", /*$sideBarStatus*/ ctx[0].help);
    			add_location(div3, file$i, 34, 8, 1119);
    			attr_dev(div4, "class", "icon svelte-11m8is8");
    			toggle_class(div4, "active", /*$sideBarStatus*/ ctx[0].about);
    			add_location(div4, file$i, 37, 8, 1251);
    			attr_dev(div5, "class", "bottom svelte-11m8is8");
    			add_location(div5, file$i, 33, 4, 1090);
    			attr_dev(div6, "id", "sidenav");
    			attr_dev(div6, "class", "svelte-11m8is8");
    			add_location(div6, file$i, 23, 0, 726);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			mount_component(tableofcontents32, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			mount_component(settings32, div1, null);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			mount_component(help32, div3, null);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			mount_component(information32, div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[3], false, false, false),
    					listen_dev(div3, "click", /*click_handler_2*/ ctx[4], false, false, false),
    					listen_dev(div4, "click", /*click_handler_3*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$sideBarStatus*/ 1) {
    				toggle_class(div0, "active", /*$sideBarStatus*/ ctx[0].informations);
    			}

    			if (dirty & /*$sideBarStatus*/ 1) {
    				toggle_class(div1, "active", /*$sideBarStatus*/ ctx[0].settings);
    			}

    			if (dirty & /*$sideBarStatus*/ 1) {
    				toggle_class(div3, "active", /*$sideBarStatus*/ ctx[0].help);
    			}

    			if (dirty & /*$sideBarStatus*/ 1) {
    				toggle_class(div4, "active", /*$sideBarStatus*/ ctx[0].about);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tableofcontents32.$$.fragment, local);
    			transition_in(settings32.$$.fragment, local);
    			transition_in(help32.$$.fragment, local);
    			transition_in(information32.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tableofcontents32.$$.fragment, local);
    			transition_out(settings32.$$.fragment, local);
    			transition_out(help32.$$.fragment, local);
    			transition_out(information32.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(tableofcontents32);
    			destroy_component(settings32);
    			destroy_component(help32);
    			destroy_component(information32);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $sideBarStatus;
    	validate_store(sideBarStatus, "sideBarStatus");
    	component_subscribe($$self, sideBarStatus, $$value => $$invalidate(0, $sideBarStatus = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SideNav", slots, []);

    	const toggle = section => {
    		sideBarStatus.update(sideBarStatus => {
    			Object.keys(sideBarStatus).map(key => {
    				if (key === section) {
    					sideBarStatus[key] = !sideBarStatus[key];
    				} else {
    					sideBarStatus[key] = false;
    				}
    			});

    			sideBarStatus.active = sideBarStatus[section];
    			return sideBarStatus;
    		});
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SideNav> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => toggle("informations");
    	const click_handler_1 = () => toggle("settings");
    	const click_handler_2 = () => toggle("help");
    	const click_handler_3 = () => toggle("about");

    	$$self.$capture_state = () => ({
    		sideBarStatus,
    		TableOfContents32,
    		Settings32,
    		Help32,
    		Information32,
    		toggle,
    		$sideBarStatus
    	});

    	return [
    		$sideBarStatus,
    		toggle,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class SideNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideNav",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/svelte/components/side/informations/SuraSelector.svelte generated by Svelte v3.37.0 */
    const file$h = "src/svelte/components/side/informations/SuraSelector.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (13:4) {#each Sura as sura, index}
    function create_each_block$6(ctx) {
    	let option;
    	let t0_value = /*index*/ ctx[7] + 1 + "";
    	let t0;
    	let t1;
    	let t2_value = /*sura*/ ctx[5][5] + "";
    	let t2;
    	let t3;
    	let t4_value = /*sura*/ ctx[5][4] + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text("- ");
    			t2 = text(t2_value);
    			t3 = text(" (");
    			t4 = text(t4_value);
    			t5 = text(")");
    			option.__value = /*sura*/ ctx[5][0];
    			option.value = option.__value;
    			add_location(option, file$h, 13, 8, 359);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    			append_dev(option, t4);
    			append_dev(option, t5);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(13:4) {#each Sura as sura, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = Sura;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (/*$ayaNumberInQuran*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$h, 11, 0, 254);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$ayaNumberInQuran*/ ctx[1]);
    			/*select_binding*/ ctx[3](select);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Sura*/ 0) {
    				each_value = Sura;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$ayaNumberInQuran*/ 2) {
    				select_option(select, /*$ayaNumberInQuran*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			/*select_binding*/ ctx[3](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $suraNumber;
    	let $ayaNumberInQuran;
    	validate_store(suraNumber, "suraNumber");
    	component_subscribe($$self, suraNumber, $$value => $$invalidate(4, $suraNumber = $$value));
    	validate_store(ayaNumberInQuran, "ayaNumberInQuran");
    	component_subscribe($$self, ayaNumberInQuran, $$value => $$invalidate(1, $ayaNumberInQuran = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SuraSelector", slots, []);
    	let suraSelector;

    	afterUpdate(() => {
    		$$invalidate(0, suraSelector.selectedIndex = $suraNumber, suraSelector);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SuraSelector> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$ayaNumberInQuran = select_value(this);
    		ayaNumberInQuran.set($ayaNumberInQuran);
    	}

    	function select_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			suraSelector = $$value;
    			$$invalidate(0, suraSelector);
    		});
    	}

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		ayaNumberInQuran,
    		suraNumber,
    		Sura,
    		suraSelector,
    		$suraNumber,
    		$ayaNumberInQuran
    	});

    	$$self.$inject_state = $$props => {
    		if ("suraSelector" in $$props) $$invalidate(0, suraSelector = $$props.suraSelector);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [suraSelector, $ayaNumberInQuran, select_change_handler, select_binding];
    }

    class SuraSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SuraSelector",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/svelte/components/side/informations/AyaSelector.svelte generated by Svelte v3.37.0 */
    const file$g = "src/svelte/components/side/informations/AyaSelector.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (13:4) {#each Array(Sura[$suraNumber][1]) as _, index}
    function create_each_block$5(ctx) {
    	let option;
    	let t0;
    	let t1_value = /*index*/ ctx[7] + 1 + "";
    	let t1;
    	let t2;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text("aya ");
    			t1 = text(t1_value);
    			t2 = space();
    			option.__value = option_value_value = Sura[/*$suraNumber*/ ctx[2]][0] + /*index*/ ctx[7];
    			option.value = option.__value;
    			add_location(option, file$g, 13, 8, 385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$suraNumber*/ 4 && option_value_value !== (option_value_value = Sura[/*$suraNumber*/ ctx[2]][0] + /*index*/ ctx[7])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(13:4) {#each Array(Sura[$suraNumber][1]) as _, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = Array(Sura[/*$suraNumber*/ ctx[2]][1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (/*$ayaNumberInQuran*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$g, 11, 0, 261);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$ayaNumberInQuran*/ ctx[1]);
    			/*select_binding*/ ctx[4](select);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Sura, $suraNumber*/ 4) {
    				each_value = Array(Sura[/*$suraNumber*/ ctx[2]][1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$ayaNumberInQuran*/ 2) {
    				select_option(select, /*$ayaNumberInQuran*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			/*select_binding*/ ctx[4](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $ayaNumberInQuran;
    	let $suraNumber;
    	validate_store(ayaNumberInQuran, "ayaNumberInQuran");
    	component_subscribe($$self, ayaNumberInQuran, $$value => $$invalidate(1, $ayaNumberInQuran = $$value));
    	validate_store(suraNumber, "suraNumber");
    	component_subscribe($$self, suraNumber, $$value => $$invalidate(2, $suraNumber = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AyaSelector", slots, []);
    	let ayaSelector;

    	afterUpdate(() => {
    		$$invalidate(0, ayaSelector.value = $ayaNumberInQuran.toString(), ayaSelector);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AyaSelector> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$ayaNumberInQuran = select_value(this);
    		ayaNumberInQuran.set($ayaNumberInQuran);
    	}

    	function select_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			ayaSelector = $$value;
    			$$invalidate(0, ayaSelector);
    		});
    	}

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		ayaNumberInQuran,
    		suraNumber,
    		Sura,
    		ayaSelector,
    		$ayaNumberInQuran,
    		$suraNumber
    	});

    	$$self.$inject_state = $$props => {
    		if ("ayaSelector" in $$props) $$invalidate(0, ayaSelector = $$props.ayaSelector);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		ayaSelector,
    		$ayaNumberInQuran,
    		$suraNumber,
    		select_change_handler,
    		select_binding
    	];
    }

    class AyaSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AyaSelector",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/svelte/components/side/informations/JuzSelector.svelte generated by Svelte v3.37.0 */
    const file$f = "src/svelte/components/side/informations/JuzSelector.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (13:4) {#each Array(30) as _, index}
    function create_each_block$4(ctx) {
    	let option;
    	let t0;
    	let t1_value = /*index*/ ctx[7] + 1 + "";
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text("juz ");
    			t1 = text(t1_value);
    			option.__value = Juz[/*index*/ ctx[7]][2];
    			option.value = option.__value;
    			add_location(option, file$f, 13, 8, 355);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(13:4) {#each Array(30) as _, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = Array(30);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (/*$ayaNumberInQuran*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$f, 11, 0, 249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$ayaNumberInQuran*/ ctx[1]);
    			/*select_binding*/ ctx[3](select);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Juz*/ 0) {
    				each_value = Array(30);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$ayaNumberInQuran*/ 2) {
    				select_option(select, /*$ayaNumberInQuran*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			/*select_binding*/ ctx[3](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $juzNumber;
    	let $ayaNumberInQuran;
    	validate_store(juzNumber, "juzNumber");
    	component_subscribe($$self, juzNumber, $$value => $$invalidate(4, $juzNumber = $$value));
    	validate_store(ayaNumberInQuran, "ayaNumberInQuran");
    	component_subscribe($$self, ayaNumberInQuran, $$value => $$invalidate(1, $ayaNumberInQuran = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JuzSelector", slots, []);
    	let juzSelector;

    	afterUpdate(() => {
    		$$invalidate(0, juzSelector.selectedIndex = $juzNumber, juzSelector);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JuzSelector> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$ayaNumberInQuran = select_value(this);
    		ayaNumberInQuran.set($ayaNumberInQuran);
    	}

    	function select_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			juzSelector = $$value;
    			$$invalidate(0, juzSelector);
    		});
    	}

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		ayaNumberInQuran,
    		juzNumber,
    		Juz,
    		juzSelector,
    		$juzNumber,
    		$ayaNumberInQuran
    	});

    	$$self.$inject_state = $$props => {
    		if ("juzSelector" in $$props) $$invalidate(0, juzSelector = $$props.juzSelector);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [juzSelector, $ayaNumberInQuran, select_change_handler, select_binding];
    }

    class JuzSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JuzSelector",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/svelte/components/side/informations/PageSelector.svelte generated by Svelte v3.37.0 */
    const file$e = "src/svelte/components/side/informations/PageSelector.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (14:4) {#each Array(604) as _, index}
    function create_each_block$3(ctx) {
    	let option;
    	let t_value = /*index*/ ctx[7] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = Page[/*index*/ ctx[7]][2];
    			option.value = option.__value;
    			add_location(option, file$e, 14, 8, 363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(14:4) {#each Array(604) as _, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = Array(604);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "svelte-4s9p29");
    			if (/*$ayaNumberInQuran*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$e, 12, 0, 255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$ayaNumberInQuran*/ ctx[1]);
    			/*select_binding*/ ctx[3](select);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Page*/ 0) {
    				each_value = Array(604);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$ayaNumberInQuran*/ 2) {
    				select_option(select, /*$ayaNumberInQuran*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			/*select_binding*/ ctx[3](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $pageNumber;
    	let $ayaNumberInQuran;
    	validate_store(pageNumber, "pageNumber");
    	component_subscribe($$self, pageNumber, $$value => $$invalidate(4, $pageNumber = $$value));
    	validate_store(ayaNumberInQuran, "ayaNumberInQuran");
    	component_subscribe($$self, ayaNumberInQuran, $$value => $$invalidate(1, $ayaNumberInQuran = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PageSelector", slots, []);
    	let pageSelector;

    	afterUpdate(() => {
    		$$invalidate(0, pageSelector.selectedIndex = $pageNumber, pageSelector);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PageSelector> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$ayaNumberInQuran = select_value(this);
    		ayaNumberInQuran.set($ayaNumberInQuran);
    	}

    	function select_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			pageSelector = $$value;
    			$$invalidate(0, pageSelector);
    		});
    	}

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		ayaNumberInQuran,
    		pageNumber,
    		Page,
    		pageSelector,
    		$pageNumber,
    		$ayaNumberInQuran
    	});

    	$$self.$inject_state = $$props => {
    		if ("pageSelector" in $$props) $$invalidate(0, pageSelector = $$props.pageSelector);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pageSelector, $ayaNumberInQuran, select_change_handler, select_binding];
    }

    class PageSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageSelector",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/svelte/components/side/Informations.svelte generated by Svelte v3.37.0 */
    const file$d = "src/svelte/components/side/Informations.svelte";

    // (53:0) {#if sajda !== -1}
    function create_if_block$8(ctx) {
    	let div;
    	let span;
    	let t1;
    	let t2_value = Sajda[/*sajda*/ ctx[3]][2] + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "۩ Sajda";
    			t1 = text("\n        (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			attr_dev(span, "class", "content svelte-11nhzas");
    			add_location(span, file$d, 54, 8, 1397);
    			attr_dev(div, "class", "svelte-11nhzas");
    			add_location(div, file$d, 53, 4, 1383);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sajda*/ 8 && t2_value !== (t2_value = Sajda[/*sajda*/ ctx[3]][2] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(53:0) {#if sajda !== -1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let suraselector;
    	let t0;
    	let ayaselector;
    	let t1;
    	let div0;
    	let t2_value = Sura[/*$suraNumber*/ ctx[4]][4] + "";
    	let t2;
    	let t3;
    	let br0;
    	let t4;
    	let t5_value = Sura[/*$suraNumber*/ ctx[4]][5] + "";
    	let t5;
    	let t6;
    	let br1;
    	let t7;
    	let t8_value = Sura[/*$suraNumber*/ ctx[4]][6] + "";
    	let t8;
    	let t9;
    	let div1;
    	let t10;
    	let br2;
    	let t11;
    	let span;
    	let t12_value = Sura[/*$suraNumber*/ ctx[4]][7] + "";
    	let t12;
    	let t13;

    	let t14_value = (Sura[/*$suraNumber*/ ctx[4]][7] === "Medinan"
    	? "مدنی"
    	: "مکی") + "";

    	let t14;
    	let t15;
    	let div2;
    	let t16;
    	let t17_value = Sura[/*$suraNumber*/ ctx[4]][1] + "";
    	let t17;
    	let t18;
    	let div3;
    	let t19;
    	let t20_value = Sura[/*$suraNumber*/ ctx[4]][3] + "";
    	let t20;
    	let t21;
    	let hr0;
    	let t22;
    	let t23;
    	let div4;
    	let t24;
    	let t25_value = /*$ayaNumberInQuran*/ ctx[0] + 1 + "";
    	let t25;
    	let t26;
    	let hr1;
    	let t27;
    	let juzselector;
    	let t28;
    	let div5;
    	let t29;
    	let t30;
    	let t31;
    	let t32;
    	let t33;
    	let t34;
    	let div6;
    	let t35;
    	let t36_value = /*$hizbNumber*/ ctx[5] + 1 + "";
    	let t36;
    	let current;
    	suraselector = new SuraSelector({ $$inline: true });
    	ayaselector = new AyaSelector({ $$inline: true });
    	let if_block = /*sajda*/ ctx[3] !== -1 && create_if_block$8(ctx);
    	juzselector = new JuzSelector({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(suraselector.$$.fragment);
    			t0 = space();
    			create_component(ayaselector.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			t8 = text(t8_value);
    			t9 = space();
    			div1 = element("div");
    			t10 = text("Place of Revelation:\n    ");
    			br2 = element("br");
    			t11 = space();
    			span = element("span");
    			t12 = text(t12_value);
    			t13 = space();
    			t14 = text(t14_value);
    			t15 = space();
    			div2 = element("div");
    			t16 = text("Verses: ");
    			t17 = text(t17_value);
    			t18 = space();
    			div3 = element("div");
    			t19 = text("order: ");
    			t20 = text(t20_value);
    			t21 = space();
    			hr0 = element("hr");
    			t22 = space();
    			if (if_block) if_block.c();
    			t23 = space();
    			div4 = element("div");
    			t24 = text("aya number in Quran:\n    ");
    			t25 = text(t25_value);
    			t26 = space();
    			hr1 = element("hr");
    			t27 = space();
    			create_component(juzselector.$$.fragment);
    			t28 = space();
    			div5 = element("div");
    			t29 = text("(page ");
    			t30 = text(/*currentJuzPage*/ ctx[2]);
    			t31 = text(" of ");
    			t32 = text(/*juzTotalPages*/ ctx[1]);
    			t33 = text(")");
    			t34 = space();
    			div6 = element("div");
    			t35 = text("hizb:\n    ");
    			t36 = text(t36_value);
    			add_location(br0, file$d, 26, 4, 900);
    			add_location(br1, file$d, 28, 4, 948);
    			attr_dev(div0, "class", "content svelte-11nhzas");
    			add_location(div0, file$d, 24, 0, 837);
    			add_location(br2, file$d, 35, 4, 1052);
    			add_location(span, file$d, 36, 4, 1063);
    			attr_dev(div1, "class", "content svelte-11nhzas");
    			add_location(div1, file$d, 33, 0, 1001);
    			attr_dev(div2, "class", "content svelte-11nhzas");
    			add_location(div2, file$d, 42, 0, 1203);
    			attr_dev(div3, "class", "content svelte-11nhzas");
    			add_location(div3, file$d, 46, 0, 1278);
    			add_location(hr0, file$d, 50, 0, 1352);
    			attr_dev(div4, "class", "content svelte-11nhzas");
    			add_location(div4, file$d, 59, 0, 1492);
    			add_location(hr1, file$d, 64, 0, 1575);
    			attr_dev(div5, "class", "content svelte-11nhzas");
    			add_location(div5, file$d, 67, 0, 1599);
    			attr_dev(div6, "class", "content svelte-11nhzas");
    			add_location(div6, file$d, 71, 0, 1676);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(suraselector, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(ayaselector, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, br0);
    			append_dev(div0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, t6);
    			append_dev(div0, br1);
    			append_dev(div0, t7);
    			append_dev(div0, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t10);
    			append_dev(div1, br2);
    			append_dev(div1, t11);
    			append_dev(div1, span);
    			append_dev(span, t12);
    			append_dev(span, t13);
    			append_dev(span, t14);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t16);
    			append_dev(div2, t17);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, t19);
    			append_dev(div3, t20);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t22, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, t24);
    			append_dev(div4, t25);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t27, anchor);
    			mount_component(juzselector, target, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, t29);
    			append_dev(div5, t30);
    			append_dev(div5, t31);
    			append_dev(div5, t32);
    			append_dev(div5, t33);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, t35);
    			append_dev(div6, t36);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$suraNumber*/ 16) && t2_value !== (t2_value = Sura[/*$suraNumber*/ ctx[4]][4] + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*$suraNumber*/ 16) && t5_value !== (t5_value = Sura[/*$suraNumber*/ ctx[4]][5] + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*$suraNumber*/ 16) && t8_value !== (t8_value = Sura[/*$suraNumber*/ ctx[4]][6] + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*$suraNumber*/ 16) && t12_value !== (t12_value = Sura[/*$suraNumber*/ ctx[4]][7] + "")) set_data_dev(t12, t12_value);

    			if ((!current || dirty & /*$suraNumber*/ 16) && t14_value !== (t14_value = (Sura[/*$suraNumber*/ ctx[4]][7] === "Medinan"
    			? "مدنی"
    			: "مکی") + "")) set_data_dev(t14, t14_value);

    			if ((!current || dirty & /*$suraNumber*/ 16) && t17_value !== (t17_value = Sura[/*$suraNumber*/ ctx[4]][1] + "")) set_data_dev(t17, t17_value);
    			if ((!current || dirty & /*$suraNumber*/ 16) && t20_value !== (t20_value = Sura[/*$suraNumber*/ ctx[4]][3] + "")) set_data_dev(t20, t20_value);

    			if (/*sajda*/ ctx[3] !== -1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(t23.parentNode, t23);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((!current || dirty & /*$ayaNumberInQuran*/ 1) && t25_value !== (t25_value = /*$ayaNumberInQuran*/ ctx[0] + 1 + "")) set_data_dev(t25, t25_value);
    			if (!current || dirty & /*currentJuzPage*/ 4) set_data_dev(t30, /*currentJuzPage*/ ctx[2]);
    			if (!current || dirty & /*juzTotalPages*/ 2) set_data_dev(t32, /*juzTotalPages*/ ctx[1]);
    			if ((!current || dirty & /*$hizbNumber*/ 32) && t36_value !== (t36_value = /*$hizbNumber*/ ctx[5] + 1 + "")) set_data_dev(t36, t36_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(suraselector.$$.fragment, local);
    			transition_in(ayaselector.$$.fragment, local);
    			transition_in(juzselector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(suraselector.$$.fragment, local);
    			transition_out(ayaselector.$$.fragment, local);
    			transition_out(juzselector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(suraselector, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(ayaselector, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t22);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t27);
    			destroy_component(juzselector, detaching);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $juzNumber;
    	let $pageNumber;
    	let $ayaNumberInQuran;
    	let $suraNumber;
    	let $hizbNumber;
    	validate_store(juzNumber, "juzNumber");
    	component_subscribe($$self, juzNumber, $$value => $$invalidate(6, $juzNumber = $$value));
    	validate_store(pageNumber, "pageNumber");
    	component_subscribe($$self, pageNumber, $$value => $$invalidate(7, $pageNumber = $$value));
    	validate_store(ayaNumberInQuran, "ayaNumberInQuran");
    	component_subscribe($$self, ayaNumberInQuran, $$value => $$invalidate(0, $ayaNumberInQuran = $$value));
    	validate_store(suraNumber, "suraNumber");
    	component_subscribe($$self, suraNumber, $$value => $$invalidate(4, $suraNumber = $$value));
    	validate_store(hizbNumber, "hizbNumber");
    	component_subscribe($$self, hizbNumber, $$value => $$invalidate(5, $hizbNumber = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Informations", slots, []);
    	let juzTotalPages;
    	let currentJuzPage;
    	let sajda;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Informations> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SuraSelector,
    		AyaSelector,
    		JuzSelector,
    		PageSelector,
    		ayaNumberInQuran,
    		pageNumber,
    		juzNumber,
    		hizbNumber,
    		suraNumber,
    		QuranData: QuranData$1,
    		juzTotalPages,
    		currentJuzPage,
    		sajda,
    		$juzNumber,
    		$pageNumber,
    		$ayaNumberInQuran,
    		$suraNumber,
    		$hizbNumber
    	});

    	$$self.$inject_state = $$props => {
    		if ("juzTotalPages" in $$props) $$invalidate(1, juzTotalPages = $$props.juzTotalPages);
    		if ("currentJuzPage" in $$props) $$invalidate(2, currentJuzPage = $$props.currentJuzPage);
    		if ("sajda" in $$props) $$invalidate(3, sajda = $$props.sajda);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$juzNumber, $pageNumber, $ayaNumberInQuran*/ 193) {
    			{
    				$$invalidate(1, juzTotalPages = getPageNumber(Juz[$juzNumber + 1][2]) - getPageNumber(Juz[$juzNumber][2]));
    				$$invalidate(2, currentJuzPage = $pageNumber - getPageNumber(Juz[$juzNumber][2]) + 1);
    				$$invalidate(3, sajda = Sajda.map(array => array[3]).indexOf(Number($ayaNumberInQuran)));
    			}
    		}
    	};

    	return [
    		$ayaNumberInQuran,
    		juzTotalPages,
    		currentJuzPage,
    		sajda,
    		$suraNumber,
    		$hizbNumber,
    		$juzNumber,
    		$pageNumber
    	];
    }

    class Informations extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Informations",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/svelte/components/side/settings/TranslateSelector.svelte generated by Svelte v3.37.0 */
    const file$c = "src/svelte/components/side/settings/TranslateSelector.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (101:8) {#each translates as file}
    function create_each_block$2(ctx) {
    	let t0_value = (/*match*/ ctx[2] = (/(\w+)_(\w+)/).exec(/*file*/ ctx[4])) + "";
    	let t0;
    	let option;
    	let t1_value = translatesList[/*file*/ ctx[4]] + "";
    	let t1;
    	let t2;
    	let t3_value = languagesList[/*match*/ ctx[2][1]] + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			option = element("option");
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")\n            ");
    			option.__value = /*file*/ ctx[4];
    			option.value = option.__value;
    			add_location(option, file$c, 102, 12, 2043);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, option, anchor);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    			append_dev(option, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(101:8) {#each translates as file}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*translates*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "svelte-hryoce");
    			if (/*$translateSelected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$c, 98, 4, 1828);
    			add_location(div, file$c, 96, 0, 1782);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$translateSelected*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*translates, languagesList, match, translatesList*/ 6) {
    				each_value = /*translates*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$translateSelected, translates*/ 3) {
    				select_option(select, /*$translateSelected*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $translateSelected;
    	validate_store(translateSelected, "translateSelected");
    	component_subscribe($$self, translateSelected, $$value => $$invalidate(0, $translateSelected = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TranslateSelector", slots, []);

    	const translates = [
    		"am_sadiq",
    		"ar_jalalayn",
    		"ar_muyassar",
    		"az_mammadaliyev",
    		"az_musayev",
    		"ber_mensur",
    		"bg_theophanov",
    		"bn_bengali",
    		"bn_hoque",
    		"bs_mlivo",
    		"de_aburida",
    		"de_zaidan",
    		"dv_divehi",
    		"en_ahmedali",
    		"en_ahmedraza",
    		"en_arberry",
    		"en_daryabadi",
    		"en_itani",
    		"en_maududi",
    		"en_pickthall",
    		"en_qarai",
    		"en_qaribullah",
    		"en_sahih",
    		"en_sarwar",
    		"en_transliteration",
    		"en_wahiduddin",
    		"en_yusufali",
    		"es_bornez",
    		"es_cortes",
    		"es_garcia",
    		"fa_ansarian",
    		"fa_ayati",
    		"fa_gharaati",
    		"fa_ghomshei",
    		"fa_khorramshahi",
    		"fa_makarem",
    		"fa_moezzi",
    		"fa_mojtabavi",
    		"fa_sadeqi",
    		"fr_hamidullah",
    		"hi_farooq",
    		"hi_hindi",
    		"id_indonesian",
    		"id_jalalayn",
    		"id_muntakhab",
    		"it_piccardo",
    		"ja_japanese",
    		"ko_korean",
    		"ku_asan",
    		"ml_abdulhameed",
    		"ml_karakunnu",
    		"ms_basmeih",
    		"nl_keyzer",
    		"nl_leemhuis",
    		"nl_siregar",
    		"no_berg",
    		"ps_abdulwali",
    		"ro_grigore",
    		"ru_abuadel",
    		"ru_krachkovsky",
    		"ru_kuliev",
    		"ru_muntahab",
    		"ru_osmanov",
    		"ru_sablukov",
    		"sd_amroti",
    		"so_abduh",
    		"sq_mehdiu",
    		"sq_nahi",
    		"sv_bernstrom",
    		"sw_barwani",
    		"ta_tamil",
    		"tg_ayati",
    		"tr_ates",
    		"tr_bulac",
    		"tr_ozturk",
    		"tr_transliteration",
    		"tr_vakfi",
    		"tr_yazir",
    		"tr_yildirim",
    		"tt_nugman",
    		"ur_ahmedali",
    		"ur_jalandhry",
    		"ur_jawadi",
    		"ur_junagarhi",
    		"ur_maududi",
    		"ur_najafi",
    		"ur_qadri",
    		"uz_sodik"
    	];

    	let match;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TranslateSelector> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$translateSelected = select_value(this);
    		translateSelected.set($translateSelected);
    		$$invalidate(1, translates);
    	}

    	$$self.$capture_state = () => ({
    		translateSelected,
    		translatesList,
    		languagesList,
    		translates,
    		match,
    		$translateSelected
    	});

    	$$self.$inject_state = $$props => {
    		if ("match" in $$props) $$invalidate(2, match = $$props.match);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$translateSelected, translates, match, select_change_handler];
    }

    class TranslateSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TranslateSelector",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/svelte/components/side/settings/TextSelector.svelte generated by Svelte v3.37.0 */
    const file$b = "src/svelte/components/side/settings/TextSelector.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i].name;
    	child_ctx[5] = list[i].module;
    	return child_ctx;
    }

    // (27:8) {#each texts as {name,module}}
    function create_each_block$1(ctx) {
    	let option;
    	let t0_value = /*name*/ ctx[4] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*module*/ ctx[5];
    			option.value = option.__value;
    			add_location(option, file$b, 27, 12, 1081);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(27:8) {#each texts as {name,module}}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div0;
    	let select;
    	let t0;
    	let div1;
    	let t1_value = /*description*/ ctx[2][/*$textSelected*/ ctx[0]] + "";
    	let t1;
    	let mounted;
    	let dispose;
    	let each_value = /*texts*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			attr_dev(select, "class", "svelte-a54llg");
    			if (/*$textSelected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$b, 24, 4, 921);
    			add_location(div0, file$b, 22, 0, 880);
    			attr_dev(div1, "class", "content svelte-a54llg");
    			add_location(div1, file$b, 35, 0, 1272);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$textSelected*/ ctx[0]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*texts*/ 2) {
    				each_value = /*texts*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$textSelected, texts*/ 3) {
    				select_option(select, /*$textSelected*/ ctx[0]);
    			}

    			if (dirty & /*$textSelected*/ 1 && t1_value !== (t1_value = /*description*/ ctx[2][/*$textSelected*/ ctx[0]] + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $textSelected;
    	validate_store(textSelected, "textSelected");
    	component_subscribe($$self, textSelected, $$value => $$invalidate(0, $textSelected = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TextSelector", slots, []);

    	const texts = [
    		{ name: "Simple", module: "quran-simple" },
    		{
    			name: "Simple Plain",
    			module: "quran-simple-plain"
    		},
    		{
    			name: "Simple Minimal",
    			module: "quran-simple-min"
    		},
    		{
    			name: "Simple Clean",
    			module: "quran-simple-clean"
    		},
    		{ name: "Uthmani", module: "quran-uthmani" },
    		{
    			name: "Uthmani Minimal",
    			module: "quran-uthmani-min"
    		}
    	];

    	const description = {
    		"quran-simple": "Quran text in Imlaaei script.",
    		"quran-simple-plain": "Simple text without special demonstration of Ikhfas and Idghams.",
    		"quran-simple-min": "Simple text with minimal number of diacritics and symbols.",
    		"quran-simple-clean": "Simple text with no diacritics or symbols.",
    		"quran-uthmani": "Uthmani text, according to Medina Mushaf.",
    		"quran-uthmani-min": "Uthmani text with minimal number of diacritics and symbols."
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TextSelector> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$textSelected = select_value(this);
    		textSelected.set($textSelected);
    		$$invalidate(1, texts);
    	}

    	$$self.$capture_state = () => ({
    		textSelected,
    		texts,
    		description,
    		$textSelected
    	});

    	return [$textSelected, texts, description, select_change_handler];
    }

    class TextSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextSelector",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/svelte/components/side/settings/CheckBox.svelte generated by Svelte v3.37.0 */

    const file$a = "src/svelte/components/side/settings/CheckBox.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let label;
    	let label_id_value;
    	let t;
    	let input;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			if (default_slot) default_slot.c();
    			t = space();
    			input = element("input");
    			attr_dev(label, "for", /*id*/ ctx[2]);
    			attr_dev(label, "id", label_id_value = "" + (/*id*/ ctx[2] + "_label"));
    			attr_dev(label, "class", "text svelte-upkdeo");
    			add_location(label, file$a, 7, 4, 135);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			attr_dev(input, "class", "svelte-upkdeo");
    			add_location(input, file$a, 10, 4, 222);
    			attr_dev(div, "class", "checkbox svelte-upkdeo");
    			add_location(div, file$a, 6, 0, 108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			append_dev(div, t);
    			append_dev(div, input);
    			input.checked = /*checked*/ ctx[0];
    			/*input_binding*/ ctx[7](input);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[6]),
    					listen_dev(input, "click", /*click_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(label, "for", /*id*/ ctx[2]);
    			}

    			if (!current || dirty & /*id*/ 4 && label_id_value !== (label_id_value = "" + (/*id*/ ctx[2] + "_label"))) {
    				attr_dev(label, "id", label_id_value);
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*input_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CheckBox", slots, ['default']);
    	let { id = checkbox } = $$props;
    	let { checked = false } = $$props;
    	let { thisCheckBox } = $$props;
    	const writable_props = ["id", "checked", "thisCheckBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CheckBox> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			thisCheckBox = $$value;
    			$$invalidate(1, thisCheckBox);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("thisCheckBox" in $$props) $$invalidate(1, thisCheckBox = $$props.thisCheckBox);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ id, checked, thisCheckBox });

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("thisCheckBox" in $$props) $$invalidate(1, thisCheckBox = $$props.thisCheckBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		checked,
    		thisCheckBox,
    		id,
    		$$scope,
    		slots,
    		click_handler,
    		input_change_handler,
    		input_binding
    	];
    }

    class CheckBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { id: 2, checked: 0, thisCheckBox: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckBox",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*thisCheckBox*/ ctx[1] === undefined && !("thisCheckBox" in props)) {
    			console.warn("<CheckBox> was created without expected prop 'thisCheckBox'");
    		}
    	}

    	get id() {
    		throw new Error("<CheckBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<CheckBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<CheckBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<CheckBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thisCheckBox() {
    		throw new Error("<CheckBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thisCheckBox(value) {
    		throw new Error("<CheckBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/TextScale16/TextScale16.svelte generated by Svelte v3.37.0 */

    const file$9 = "node_modules/carbon-icons-svelte/lib/TextScale16/TextScale16.svelte";

    // (39:4) {#if title}
    function create_if_block$7(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$9, 39, 6, 1113);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$3.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const default_slot_or_fallback = default_slot || fallback_block$3(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "TextScale16" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ width: "16" },
    		{ height: "16" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path0, "d", "M30 5L30 8 22 8 22 26 19 26 19 8 11 8 11 5 30 5z");
    			add_location(path0, file$9, 36, 2, 949);
    			attr_dev(path1, "d", "M7 26L7 14 2 14 2 12 14 12 14 14 9 14 9 26 7 26z");
    			add_location(path1, file$9, 36, 68, 1015);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$9, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[14], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[15], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[16], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "TextScale16" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ width: "16" },
    				{ height: "16" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TextScale16", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(8, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(9, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(7, ariaLabel = $$props["aria-label"]);
    		$$invalidate(8, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 388) {
    			$$invalidate(9, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 992) {
    			$$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class TextScale16 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextScale16",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get class() {
    		throw new Error("<TextScale16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TextScale16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextScale16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextScale16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<TextScale16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<TextScale16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<TextScale16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<TextScale16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<TextScale16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<TextScale16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TextScale16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TextScale16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/TextAlignLeft32/TextAlignLeft32.svelte generated by Svelte v3.37.0 */

    const file$8 = "node_modules/carbon-icons-svelte/lib/TextAlignLeft32/TextAlignLeft32.svelte";

    // (39:4) {#if title}
    function create_if_block$6(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$8, 39, 6, 1077);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const default_slot_or_fallback = default_slot || fallback_block$2(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "TextAlignLeft32" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ width: "32" },
    		{ height: "32" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path, "d", "M12 6H26V8H12zM12 12H22V14H12zM12 18H26V20H12zM12 24H22V26H12zM6 4H8V28H6z");
    			add_location(path, file$8, 36, 2, 953);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$8, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[14], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[15], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[16], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "TextAlignLeft32" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ width: "32" },
    				{ height: "32" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TextAlignLeft32", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(8, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(9, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(7, ariaLabel = $$props["aria-label"]);
    		$$invalidate(8, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 388) {
    			$$invalidate(9, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 992) {
    			$$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class TextAlignLeft32 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextAlignLeft32",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get class() {
    		throw new Error("<TextAlignLeft32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TextAlignLeft32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextAlignLeft32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextAlignLeft32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<TextAlignLeft32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<TextAlignLeft32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<TextAlignLeft32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<TextAlignLeft32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<TextAlignLeft32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<TextAlignLeft32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TextAlignLeft32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TextAlignLeft32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/Translate32/Translate32.svelte generated by Svelte v3.37.0 */

    const file$7 = "node_modules/carbon-icons-svelte/lib/Translate32/Translate32.svelte";

    // (39:4) {#if title}
    function create_if_block$5(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$7, 39, 6, 1313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "Translate32" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ width: "32" },
    		{ height: "32" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path, "d", "M27.85 29H30L24 14H21.65l-6 15H17.8l1.6-4h6.85zM20.2 23l2.62-6.56L25.45 23zM18 7V5H11V2H9V5H2V7H12.74a14.71 14.71 0 01-3.19 6.18A13.5 13.5 0 017.26 9H5.16a16.47 16.47 0 003 5.58A16.84 16.84 0 013 18l.75 1.86A18.47 18.47 0 009.53 16a16.92 16.92 0 005.76 3.84L16 18a14.48 14.48 0 01-5.12-3.37A17.64 17.64 0 0014.8 7z");
    			add_location(path, file$7, 36, 2, 949);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$7, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[14], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[15], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[16], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "Translate32" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ width: "32" },
    				{ height: "32" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Translate32", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(8, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(9, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(7, ariaLabel = $$props["aria-label"]);
    		$$invalidate(8, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 388) {
    			$$invalidate(9, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 992) {
    			$$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class Translate32 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Translate32",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<Translate32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Translate32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Translate32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Translate32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Translate32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Translate32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<Translate32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<Translate32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Translate32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Translate32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Translate32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Translate32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/TextHighlight32/TextHighlight32.svelte generated by Svelte v3.37.0 */

    const file$6 = "node_modules/carbon-icons-svelte/lib/TextHighlight32/TextHighlight32.svelte";

    // (39:4) {#if title}
    function create_if_block$4(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$6, 39, 6, 1263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "TextHighlight32" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ width: "32" },
    		{ height: "32" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path0, "d", "M12 15H5a3 3 0 01-3-3V10A3 3 0 015 7h5V5A1 1 0 009 4H3V2H9a3 3 0 013 3zM5 9a1 1 0 00-1 1v2a1 1 0 001 1h5V9zM20 23v2a1 1 0 001 1h5V22H21A1 1 0 0020 23z");
    			add_location(path0, file$6, 36, 2, 953);
    			attr_dev(path1, "d", "M2,30H30V2Zm26-2H21a3,3,0,0,1-3-3V23a3,3,0,0,1,3-3h5V18a1,1,0,0,0-1-1H19V15h6a3,3,0,0,1,3,3Z");
    			add_location(path1, file$6, 36, 170, 1121);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$6, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[14], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[15], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[16], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "TextHighlight32" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ width: "32" },
    				{ height: "32" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TextHighlight32", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(8, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(9, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(7, ariaLabel = $$props["aria-label"]);
    		$$invalidate(8, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 388) {
    			$$invalidate(9, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 992) {
    			$$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class TextHighlight32 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextHighlight32",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<TextHighlight32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TextHighlight32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextHighlight32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextHighlight32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<TextHighlight32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<TextHighlight32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<TextHighlight32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<TextHighlight32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<TextHighlight32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<TextHighlight32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TextHighlight32>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TextHighlight32>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte/components/side/settings.svelte generated by Svelte v3.37.0 */
    const file$5 = "src/svelte/components/side/settings.svelte";

    // (46:4) {#if styleCheck}
    function create_if_block$3(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "dark.css");
    			add_location(link, file$5, 46, 8, 1394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(46:4) {#if styleCheck}",
    		ctx
    	});

    	return block;
    }

    // (52:4) <CheckBox         id="changestyle"         bind:checked={styleCheck}         bind:thisCheckBox={styleCheckBox}     >
    function create_default_slot_2(ctx) {
    	let div;
    	let texthighlight32;
    	let t0;
    	let span;
    	let current;
    	texthighlight32 = new TextHighlight32({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(texthighlight32.$$.fragment);
    			t0 = space();
    			span = element("span");
    			span.textContent = "Dark Theme";
    			add_location(span, file$5, 58, 8, 1665);
    			attr_dev(div, "class", "title svelte-dksl77");
    			add_location(div, file$5, 56, 4, 1609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(texthighlight32, div, null);
    			append_dev(div, t0);
    			append_dev(div, span);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(texthighlight32.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(texthighlight32.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(texthighlight32);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(52:4) <CheckBox         id=\\\"changestyle\\\"         bind:checked={styleCheck}         bind:thisCheckBox={styleCheckBox}     >",
    		ctx
    	});

    	return block;
    }

    // (70:4) <CheckBox         id="only_text_show"         bind:thisCheckBox={textCheckBox}         on:click={checkBoxControll}     >
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("show only text");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(70:4) <CheckBox         id=\\\"only_text_show\\\"         bind:thisCheckBox={textCheckBox}         on:click={checkBoxControll}     >",
    		ctx
    	});

    	return block;
    }

    // (97:4) <CheckBox         id="only_translate_show"         bind:thisCheckBox={translateCheckBox}         on:click={checkBoxControll}     >
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("show only translate");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(97:4) <CheckBox         id=\\\"only_translate_show\\\"         bind:thisCheckBox={translateCheckBox}         on:click={checkBoxControll}     >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let t0;
    	let div8;
    	let checkbox0;
    	let updating_checked;
    	let updating_thisCheckBox;
    	let t1;
    	let hr0;
    	let t2;
    	let div0;
    	let textalignleft32;
    	let t3;
    	let span0;
    	let t5;
    	let textselector;
    	let t6;
    	let checkbox1;
    	let updating_thisCheckBox_1;
    	let t7;
    	let div3;
    	let div1;
    	let textscale160;
    	let t8;
    	let t9;
    	let t10;
    	let div2;
    	let button0;
    	let t12;
    	let button1;
    	let t14;
    	let button2;
    	let t16;
    	let hr1;
    	let t17;
    	let div4;
    	let translate32;
    	let t18;
    	let span1;
    	let t20;
    	let translateselector;
    	let t21;
    	let checkbox2;
    	let updating_thisCheckBox_2;
    	let t22;
    	let div7;
    	let div5;
    	let textscale161;
    	let t23;
    	let t24;
    	let t25;
    	let div6;
    	let button3;
    	let t27;
    	let button4;
    	let t29;
    	let button5;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*styleCheck*/ ctx[0] && create_if_block$3(ctx);

    	function checkbox0_checked_binding(value) {
    		/*checkbox0_checked_binding*/ ctx[7](value);
    	}

    	function checkbox0_thisCheckBox_binding(value) {
    		/*checkbox0_thisCheckBox_binding*/ ctx[8](value);
    	}

    	let checkbox0_props = {
    		id: "changestyle",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*styleCheck*/ ctx[0] !== void 0) {
    		checkbox0_props.checked = /*styleCheck*/ ctx[0];
    	}

    	if (/*styleCheckBox*/ ctx[1] !== void 0) {
    		checkbox0_props.thisCheckBox = /*styleCheckBox*/ ctx[1];
    	}

    	checkbox0 = new CheckBox({ props: checkbox0_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox0, "checked", checkbox0_checked_binding));
    	binding_callbacks.push(() => bind(checkbox0, "thisCheckBox", checkbox0_thisCheckBox_binding));
    	textalignleft32 = new TextAlignLeft32({ $$inline: true });
    	textselector = new TextSelector({ $$inline: true });

    	function checkbox1_thisCheckBox_binding(value) {
    		/*checkbox1_thisCheckBox_binding*/ ctx[9](value);
    	}

    	let checkbox1_props = {
    		id: "only_text_show",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*textCheckBox*/ ctx[2] !== void 0) {
    		checkbox1_props.thisCheckBox = /*textCheckBox*/ ctx[2];
    	}

    	checkbox1 = new CheckBox({ props: checkbox1_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox1, "thisCheckBox", checkbox1_thisCheckBox_binding));
    	checkbox1.$on("click", /*checkBoxControll*/ ctx[6]);
    	textscale160 = new TextScale16({ $$inline: true });
    	translate32 = new Translate32({ $$inline: true });
    	translateselector = new TranslateSelector({ $$inline: true });

    	function checkbox2_thisCheckBox_binding(value) {
    		/*checkbox2_thisCheckBox_binding*/ ctx[13](value);
    	}

    	let checkbox2_props = {
    		id: "only_translate_show",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*translateCheckBox*/ ctx[3] !== void 0) {
    		checkbox2_props.thisCheckBox = /*translateCheckBox*/ ctx[3];
    	}

    	checkbox2 = new CheckBox({ props: checkbox2_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox2, "thisCheckBox", checkbox2_thisCheckBox_binding));
    	checkbox2.$on("click", /*checkBoxControll*/ ctx[6]);
    	textscale161 = new TextScale16({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			t0 = space();
    			div8 = element("div");
    			create_component(checkbox0.$$.fragment);
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			div0 = element("div");
    			create_component(textalignleft32.$$.fragment);
    			t3 = space();
    			span0 = element("span");
    			span0.textContent = "Quran Text";
    			t5 = space();
    			create_component(textselector.$$.fragment);
    			t6 = space();
    			create_component(checkbox1.$$.fragment);
    			t7 = space();
    			div3 = element("div");
    			div1 = element("div");
    			create_component(textscale160.$$.fragment);
    			t8 = text("\n            font size:\n            ");
    			t9 = text(/*$textFontSize*/ ctx[4]);
    			t10 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "+";
    			t12 = space();
    			button1 = element("button");
    			button1.textContent = "-";
    			t14 = space();
    			button2 = element("button");
    			button2.textContent = "reset";
    			t16 = space();
    			hr1 = element("hr");
    			t17 = space();
    			div4 = element("div");
    			create_component(translate32.$$.fragment);
    			t18 = space();
    			span1 = element("span");
    			span1.textContent = "Quran Translate";
    			t20 = space();
    			create_component(translateselector.$$.fragment);
    			t21 = space();
    			create_component(checkbox2.$$.fragment);
    			t22 = space();
    			div7 = element("div");
    			div5 = element("div");
    			create_component(textscale161.$$.fragment);
    			t23 = text("\n            font size:\n            ");
    			t24 = text(/*$translateFontSize*/ ctx[5]);
    			t25 = space();
    			div6 = element("div");
    			button3 = element("button");
    			button3.textContent = "+";
    			t27 = space();
    			button4 = element("button");
    			button4.textContent = "-";
    			t29 = space();
    			button5 = element("button");
    			button5.textContent = "reset";
    			attr_dev(hr0, "class", "svelte-dksl77");
    			add_location(hr0, file$5, 62, 4, 1721);
    			add_location(span0, file$5, 66, 8, 1789);
    			attr_dev(div0, "class", "title svelte-dksl77");
    			add_location(div0, file$5, 64, 4, 1733);
    			attr_dev(div1, "class", "svelte-dksl77");
    			add_location(div1, file$5, 77, 8, 2047);
    			attr_dev(button0, "class", "size");
    			add_location(button0, file$5, 83, 12, 2173);
    			attr_dev(button1, "class", "size");
    			add_location(button1, file$5, 84, 12, 2250);
    			attr_dev(button2, "class", "size");
    			add_location(button2, file$5, 85, 12, 2327);
    			attr_dev(div2, "class", "svelte-dksl77");
    			add_location(div2, file$5, 82, 8, 2155);
    			attr_dev(div3, "class", "size_select svelte-dksl77");
    			add_location(div3, file$5, 76, 4, 2013);
    			attr_dev(hr1, "class", "svelte-dksl77");
    			add_location(hr1, file$5, 89, 4, 2432);
    			add_location(span1, file$5, 93, 8, 2496);
    			attr_dev(div4, "class", "title svelte-dksl77");
    			add_location(div4, file$5, 91, 4, 2444);
    			attr_dev(div5, "class", "svelte-dksl77");
    			add_location(div5, file$5, 104, 8, 2779);
    			attr_dev(button3, "class", "size");
    			add_location(button3, file$5, 110, 12, 2910);
    			attr_dev(button4, "class", "size");
    			add_location(button4, file$5, 111, 12, 2992);
    			attr_dev(button5, "class", "size");
    			add_location(button5, file$5, 112, 12, 3074);
    			attr_dev(div6, "class", "svelte-dksl77");
    			add_location(div6, file$5, 109, 8, 2892);
    			attr_dev(div7, "class", "size_select svelte-dksl77");
    			add_location(div7, file$5, 103, 4, 2745);
    			attr_dev(div8, "class", "setting svelte-dksl77");
    			add_location(div8, file$5, 50, 0, 1462);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(document.head, null);
    			append_dev(document.head, if_block_anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div8, anchor);
    			mount_component(checkbox0, div8, null);
    			append_dev(div8, t1);
    			append_dev(div8, hr0);
    			append_dev(div8, t2);
    			append_dev(div8, div0);
    			mount_component(textalignleft32, div0, null);
    			append_dev(div0, t3);
    			append_dev(div0, span0);
    			append_dev(div8, t5);
    			mount_component(textselector, div8, null);
    			append_dev(div8, t6);
    			mount_component(checkbox1, div8, null);
    			append_dev(div8, t7);
    			append_dev(div8, div3);
    			append_dev(div3, div1);
    			mount_component(textscale160, div1, null);
    			append_dev(div1, t8);
    			append_dev(div1, t9);
    			append_dev(div3, t10);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t12);
    			append_dev(div2, button1);
    			append_dev(div2, t14);
    			append_dev(div2, button2);
    			append_dev(div8, t16);
    			append_dev(div8, hr1);
    			append_dev(div8, t17);
    			append_dev(div8, div4);
    			mount_component(translate32, div4, null);
    			append_dev(div4, t18);
    			append_dev(div4, span1);
    			append_dev(div8, t20);
    			mount_component(translateselector, div8, null);
    			append_dev(div8, t21);
    			mount_component(checkbox2, div8, null);
    			append_dev(div8, t22);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			mount_component(textscale161, div5, null);
    			append_dev(div5, t23);
    			append_dev(div5, t24);
    			append_dev(div7, t25);
    			append_dev(div7, div6);
    			append_dev(div6, button3);
    			append_dev(div6, t27);
    			append_dev(div6, button4);
    			append_dev(div6, t29);
    			append_dev(div6, button5);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[10], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[11], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[12], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[14], false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[15], false, false, false),
    					listen_dev(button5, "click", /*click_handler_5*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*styleCheck*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const checkbox0_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				checkbox0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_checked && dirty & /*styleCheck*/ 1) {
    				updating_checked = true;
    				checkbox0_changes.checked = /*styleCheck*/ ctx[0];
    				add_flush_callback(() => updating_checked = false);
    			}

    			if (!updating_thisCheckBox && dirty & /*styleCheckBox*/ 2) {
    				updating_thisCheckBox = true;
    				checkbox0_changes.thisCheckBox = /*styleCheckBox*/ ctx[1];
    				add_flush_callback(() => updating_thisCheckBox = false);
    			}

    			checkbox0.$set(checkbox0_changes);
    			const checkbox1_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				checkbox1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_thisCheckBox_1 && dirty & /*textCheckBox*/ 4) {
    				updating_thisCheckBox_1 = true;
    				checkbox1_changes.thisCheckBox = /*textCheckBox*/ ctx[2];
    				add_flush_callback(() => updating_thisCheckBox_1 = false);
    			}

    			checkbox1.$set(checkbox1_changes);
    			if (!current || dirty & /*$textFontSize*/ 16) set_data_dev(t9, /*$textFontSize*/ ctx[4]);
    			const checkbox2_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				checkbox2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_thisCheckBox_2 && dirty & /*translateCheckBox*/ 8) {
    				updating_thisCheckBox_2 = true;
    				checkbox2_changes.thisCheckBox = /*translateCheckBox*/ ctx[3];
    				add_flush_callback(() => updating_thisCheckBox_2 = false);
    			}

    			checkbox2.$set(checkbox2_changes);
    			if (!current || dirty & /*$translateFontSize*/ 32) set_data_dev(t24, /*$translateFontSize*/ ctx[5]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox0.$$.fragment, local);
    			transition_in(textalignleft32.$$.fragment, local);
    			transition_in(textselector.$$.fragment, local);
    			transition_in(checkbox1.$$.fragment, local);
    			transition_in(textscale160.$$.fragment, local);
    			transition_in(translate32.$$.fragment, local);
    			transition_in(translateselector.$$.fragment, local);
    			transition_in(checkbox2.$$.fragment, local);
    			transition_in(textscale161.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox0.$$.fragment, local);
    			transition_out(textalignleft32.$$.fragment, local);
    			transition_out(textselector.$$.fragment, local);
    			transition_out(checkbox1.$$.fragment, local);
    			transition_out(textscale160.$$.fragment, local);
    			transition_out(translate32.$$.fragment, local);
    			transition_out(translateselector.$$.fragment, local);
    			transition_out(checkbox2.$$.fragment, local);
    			transition_out(textscale161.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			detach_dev(if_block_anchor);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div8);
    			destroy_component(checkbox0);
    			destroy_component(textalignleft32);
    			destroy_component(textselector);
    			destroy_component(checkbox1);
    			destroy_component(textscale160);
    			destroy_component(translate32);
    			destroy_component(translateselector);
    			destroy_component(checkbox2);
    			destroy_component(textscale161);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $darkTheme;
    	let $showOnlyText;
    	let $showOnlyTranslate;
    	let $textFontSize;
    	let $translateFontSize;
    	validate_store(darkTheme, "darkTheme");
    	component_subscribe($$self, darkTheme, $$value => $$invalidate(17, $darkTheme = $$value));
    	validate_store(showOnlyText, "showOnlyText");
    	component_subscribe($$self, showOnlyText, $$value => $$invalidate(18, $showOnlyText = $$value));
    	validate_store(showOnlyTranslate, "showOnlyTranslate");
    	component_subscribe($$self, showOnlyTranslate, $$value => $$invalidate(19, $showOnlyTranslate = $$value));
    	validate_store(textFontSize, "textFontSize");
    	component_subscribe($$self, textFontSize, $$value => $$invalidate(4, $textFontSize = $$value));
    	validate_store(translateFontSize, "translateFontSize");
    	component_subscribe($$self, translateFontSize, $$value => $$invalidate(5, $translateFontSize = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Settings", slots, []);
    	let styleCheck;
    	let styleCheckBox;
    	styleCheck = $darkTheme;
    	let textCheckBox;
    	let translateCheckBox;

    	afterUpdate(() => {
    		$$invalidate(2, textCheckBox.checked = $showOnlyText, textCheckBox);
    		$$invalidate(3, translateCheckBox.checked = $showOnlyTranslate, translateCheckBox);
    	});

    	function checkBoxControll(event) {
    		let that = event.target === textCheckBox
    		? translateCheckBox
    		: textCheckBox;

    		if (textCheckBox.checked && translateCheckBox.checked) {
    			that.checked = false;
    		}

    		set_store_value(showOnlyText, $showOnlyText = textCheckBox.checked, $showOnlyText);
    		set_store_value(showOnlyTranslate, $showOnlyTranslate = translateCheckBox.checked, $showOnlyTranslate);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	function checkbox0_checked_binding(value) {
    		styleCheck = value;
    		$$invalidate(0, styleCheck);
    	}

    	function checkbox0_thisCheckBox_binding(value) {
    		styleCheckBox = value;
    		$$invalidate(1, styleCheckBox);
    	}

    	function checkbox1_thisCheckBox_binding(value) {
    		textCheckBox = value;
    		$$invalidate(2, textCheckBox);
    	}

    	const click_handler = () => set_store_value(textFontSize, $textFontSize++, $textFontSize);
    	const click_handler_1 = () => set_store_value(textFontSize, $textFontSize--, $textFontSize);
    	const click_handler_2 = () => set_store_value(textFontSize, $textFontSize = 30, $textFontSize);

    	function checkbox2_thisCheckBox_binding(value) {
    		translateCheckBox = value;
    		$$invalidate(3, translateCheckBox);
    	}

    	const click_handler_3 = () => set_store_value(translateFontSize, $translateFontSize++, $translateFontSize);
    	const click_handler_4 = () => set_store_value(translateFontSize, $translateFontSize--, $translateFontSize);
    	const click_handler_5 = () => set_store_value(translateFontSize, $translateFontSize = 22, $translateFontSize);

    	$$self.$capture_state = () => ({
    		TranslateSelector,
    		TextSelector,
    		CheckBox,
    		afterUpdate,
    		showOnlyText,
    		showOnlyTranslate,
    		darkTheme,
    		textFontSize,
    		translateFontSize,
    		TextScale16,
    		TextAlignLeft32,
    		Translate32,
    		TextHighlight32,
    		styleCheck,
    		styleCheckBox,
    		textCheckBox,
    		translateCheckBox,
    		checkBoxControll,
    		$darkTheme,
    		$showOnlyText,
    		$showOnlyTranslate,
    		$textFontSize,
    		$translateFontSize
    	});

    	$$self.$inject_state = $$props => {
    		if ("styleCheck" in $$props) $$invalidate(0, styleCheck = $$props.styleCheck);
    		if ("styleCheckBox" in $$props) $$invalidate(1, styleCheckBox = $$props.styleCheckBox);
    		if ("textCheckBox" in $$props) $$invalidate(2, textCheckBox = $$props.textCheckBox);
    		if ("translateCheckBox" in $$props) $$invalidate(3, translateCheckBox = $$props.translateCheckBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*styleCheck*/ 1) {
    			set_store_value(darkTheme, $darkTheme = styleCheck, $darkTheme);
    		}
    	};

    	return [
    		styleCheck,
    		styleCheckBox,
    		textCheckBox,
    		translateCheckBox,
    		$textFontSize,
    		$translateFontSize,
    		checkBoxControll,
    		checkbox0_checked_binding,
    		checkbox0_thisCheckBox_binding,
    		checkbox1_thisCheckBox_binding,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		checkbox2_thisCheckBox_binding,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/svelte/components/SidePanel.svelte generated by Svelte v3.37.0 */
    const file$4 = "src/svelte/components/SidePanel.svelte";

    function create_fragment$4(ctx) {
    	let div0;
    	let informations;
    	let div0_class_value;
    	let t0;
    	let div1;
    	let settings;
    	let div1_class_value;
    	let t1;
    	let div4;
    	let h10;
    	let t3;
    	let div2;
    	let table0;
    	let tr0;
    	let td0;
    	let t5;
    	let td1;
    	let t7;
    	let tr1;
    	let td2;
    	let t9;
    	let td3;
    	let t11;
    	let br0;
    	let t12;
    	let h11;
    	let t14;
    	let div3;
    	let table1;
    	let tr2;
    	let td4;
    	let t16;
    	let td5;
    	let t18;
    	let tr3;
    	let td6;
    	let t20;
    	let td7;
    	let t22;
    	let tr4;
    	let td8;
    	let t24;
    	let td9;
    	let t26;
    	let tr5;
    	let td10;
    	let t28;
    	let td11;
    	let t30;
    	let tr6;
    	let td12;
    	let t32;
    	let tr7;
    	let td13;
    	let t34;
    	let td14;
    	let t36;
    	let tr8;
    	let td15;
    	let t38;
    	let tr9;
    	let td16;
    	let t40;
    	let td17;
    	let t42;
    	let tr10;
    	let td18;
    	let t44;
    	let tr11;
    	let td19;
    	let t46;
    	let td20;
    	let div4_class_value;
    	let t48;
    	let div8;
    	let div5;
    	let img;
    	let img_src_value;
    	let t49;
    	let h12;
    	let t51;
    	let div6;
    	let t53;
    	let p0;
    	let t54;
    	let a0;
    	let t56;
    	let br1;
    	let t57;
    	let p1;
    	let t58;
    	let a1;
    	let t60;
    	let p2;
    	let t62;
    	let br2;
    	let t63;
    	let p3;
    	let t64;
    	let br3;
    	let t65;
    	let a2;
    	let t67;
    	let br4;
    	let t68;
    	let a3;
    	let t70;
    	let br5;
    	let t71;
    	let a4;
    	let t73;
    	let t74;
    	let br6;
    	let t75;
    	let p4;
    	let t76;
    	let a5;
    	let t78;
    	let br7;
    	let t79;
    	let div7;
    	let div8_class_value;
    	let current;
    	informations = new Informations({ $$inline: true });
    	settings = new Settings({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(informations.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(settings.$$.fragment);
    			t1 = space();
    			div4 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Signs";
    			t3 = space();
    			div2 = element("div");
    			table0 = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "۞";
    			t5 = space();
    			td1 = element("td");
    			td1.textContent = "Juz/Hizb start";
    			t7 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "۩";
    			t9 = space();
    			td3 = element("td");
    			td3.textContent = "Sajda";
    			t11 = space();
    			br0 = element("br");
    			t12 = space();
    			h11 = element("h1");
    			h11.textContent = "keyboard shourtcuts";
    			t14 = space();
    			div3 = element("div");
    			table1 = element("table");
    			tr2 = element("tr");
    			td4 = element("td");
    			td4.textContent = "left";
    			t16 = space();
    			td5 = element("td");
    			td5.textContent = "next page";
    			t18 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "right";
    			t20 = space();
    			td7 = element("td");
    			td7.textContent = "previous page";
    			t22 = space();
    			tr4 = element("tr");
    			td8 = element("td");
    			td8.textContent = "up";
    			t24 = space();
    			td9 = element("td");
    			td9.textContent = "previous aya";
    			t26 = space();
    			tr5 = element("tr");
    			td10 = element("td");
    			td10.textContent = "down";
    			t28 = space();
    			td11 = element("td");
    			td11.textContent = "next aya";
    			t30 = space();
    			tr6 = element("tr");
    			td12 = element("td");
    			td12.textContent = " ";
    			t32 = space();
    			tr7 = element("tr");
    			td13 = element("td");
    			td13.textContent = "F11";
    			t34 = space();
    			td14 = element("td");
    			td14.textContent = "Full Screen";
    			t36 = space();
    			tr8 = element("tr");
    			td15 = element("td");
    			td15.textContent = " ";
    			t38 = space();
    			tr9 = element("tr");
    			td16 = element("td");
    			td16.textContent = "Ctrl(Cmd)+R";
    			t40 = space();
    			td17 = element("td");
    			td17.textContent = "Reload";
    			t42 = space();
    			tr10 = element("tr");
    			td18 = element("td");
    			td18.textContent = " ";
    			t44 = space();
    			tr11 = element("tr");
    			td19 = element("td");
    			td19.textContent = "Ctrl(Cmd)+Q";
    			t46 = space();
    			td20 = element("td");
    			td20.textContent = "Quit";
    			t48 = space();
    			div8 = element("div");
    			div5 = element("div");
    			img = element("img");
    			t49 = space();
    			h12 = element("h1");
    			h12.textContent = "Borhan";
    			t51 = space();
    			div6 = element("div");
    			div6.textContent = "مرا روزی مباد آن دم که بی یاد تو بنشینم";
    			t53 = space();
    			p0 = element("p");
    			t54 = text("Developed with love by ");
    			a0 = element("a");
    			a0.textContent = "kiavash";
    			t56 = space();
    			br1 = element("br");
    			t57 = space();
    			p1 = element("p");
    			t58 = text("text and translates: ");
    			a1 = element("a");
    			a1.textContent = "Tanzil";
    			t60 = space();
    			p2 = element("p");
    			p2.textContent = "Tanzil is an international Quranic project aimed at providing a highly-verified precise Quran text";
    			t62 = space();
    			br2 = element("br");
    			t63 = space();
    			p3 = element("p");
    			t64 = text("fonts used in the app:\n        ");
    			br3 = element("br");
    			t65 = space();
    			a2 = element("a");
    			a2.textContent = "Noon";
    			t67 = text(": Saleh Souzanchi\n        ");
    			br4 = element("br");
    			t68 = space();
    			a3 = element("a");
    			a3.textContent = "Vazir";
    			t70 = text(": Saber Rastikerdar\n        ");
    			br5 = element("br");
    			t71 = space();
    			a4 = element("a");
    			a4.textContent = "Sahel";
    			t73 = text(": Saber Rastikerdar");
    			t74 = space();
    			br6 = element("br");
    			t75 = space();
    			p4 = element("p");
    			t76 = text("If you find a bug in the program or if you feel the need for new features in the program, feel free to add new issue in ");
    			a5 = element("a");
    			a5.textContent = "github repository";
    			t78 = space();
    			br7 = element("br");
    			t79 = space();
    			div7 = element("div");
    			div7.textContent = "version 1.4.2";
    			attr_dev(div0, "id", "informations");
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*$sideBarStatus*/ ctx[0].informations ? "show" : "hide") + " svelte-rankl6"));
    			add_location(div0, file$4, 6, 0, 164);
    			attr_dev(div1, "id", "settings");
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*$sideBarStatus*/ ctx[0].settings ? "show" : "hide") + " svelte-rankl6"));
    			add_location(div1, file$4, 10, 0, 271);
    			attr_dev(h10, "class", "svelte-rankl6");
    			add_location(h10, file$4, 15, 4, 432);
    			add_location(td0, file$4, 19, 12, 515);
    			add_location(td1, file$4, 20, 12, 538);
    			add_location(tr0, file$4, 18, 8, 498);
    			add_location(td2, file$4, 23, 12, 601);
    			add_location(td3, file$4, 24, 12, 624);
    			add_location(tr1, file$4, 22, 8, 584);
    			attr_dev(table0, "class", "svelte-rankl6");
    			add_location(table0, file$4, 17, 4, 482);
    			attr_dev(div2, "class", "help_content svelte-rankl6");
    			add_location(div2, file$4, 16, 4, 451);
    			add_location(br0, file$4, 28, 4, 681);
    			attr_dev(h11, "class", "svelte-rankl6");
    			add_location(h11, file$4, 29, 4, 692);
    			add_location(td4, file$4, 33, 16, 801);
    			add_location(td5, file$4, 34, 16, 831);
    			add_location(tr2, file$4, 32, 12, 780);
    			add_location(td6, file$4, 37, 16, 901);
    			add_location(td7, file$4, 38, 16, 932);
    			add_location(tr3, file$4, 36, 12, 880);
    			add_location(td8, file$4, 41, 16, 1006);
    			add_location(td9, file$4, 42, 16, 1034);
    			add_location(tr4, file$4, 40, 12, 985);
    			add_location(td10, file$4, 45, 16, 1107);
    			add_location(td11, file$4, 46, 16, 1137);
    			add_location(tr5, file$4, 44, 12, 1086);
    			add_location(td12, file$4, 49, 16, 1206);
    			add_location(tr6, file$4, 48, 12, 1185);
    			add_location(td13, file$4, 52, 16, 1273);
    			add_location(td14, file$4, 53, 16, 1302);
    			add_location(tr7, file$4, 51, 12, 1252);
    			add_location(td15, file$4, 56, 16, 1374);
    			add_location(tr8, file$4, 55, 12, 1353);
    			add_location(td16, file$4, 59, 16, 1441);
    			add_location(td17, file$4, 60, 16, 1478);
    			add_location(tr9, file$4, 58, 12, 1420);
    			add_location(td18, file$4, 63, 16, 1545);
    			add_location(tr10, file$4, 62, 12, 1524);
    			add_location(td19, file$4, 66, 16, 1612);
    			add_location(td20, file$4, 67, 16, 1649);
    			add_location(tr11, file$4, 65, 12, 1591);
    			attr_dev(table1, "class", "svelte-rankl6");
    			add_location(table1, file$4, 31, 8, 760);
    			attr_dev(div3, "class", "help_content svelte-rankl6");
    			add_location(div3, file$4, 30, 4, 725);
    			attr_dev(div4, "id", "help");
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*$sideBarStatus*/ ctx[0].help ? "show" : "hide") + " svelte-rankl6"));
    			add_location(div4, file$4, 14, 0, 366);
    			if (img.src !== (img_src_value = "./assets/images/borhan.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "class", "svelte-rankl6");
    			add_location(img, file$4, 75, 8, 1812);
    			attr_dev(h12, "class", "svelte-rankl6");
    			add_location(h12, file$4, 76, 8, 1872);
    			attr_dev(div5, "class", "logo svelte-rankl6");
    			add_location(div5, file$4, 74, 4, 1785);
    			attr_dev(div6, "class", "rtl_top svelte-rankl6");
    			add_location(div6, file$4, 78, 4, 1903);
    			attr_dev(a0, "href", "https://kiavash.one");
    			add_location(a0, file$4, 80, 30, 2001);
    			add_location(p0, file$4, 80, 4, 1975);
    			add_location(br1, file$4, 81, 4, 2051);
    			attr_dev(a1, "href", "tanzil.ir");
    			add_location(a1, file$4, 82, 28, 2086);
    			add_location(p1, file$4, 82, 4, 2062);
    			add_location(p2, file$4, 83, 4, 2125);
    			add_location(br2, file$4, 84, 4, 2235);
    			add_location(br3, file$4, 87, 8, 2289);
    			attr_dev(a2, "href", "https://github.com/font-store/NoonFont");
    			add_location(a2, file$4, 88, 8, 2304);
    			add_location(br4, file$4, 89, 8, 2387);
    			attr_dev(a3, "href", "https://github.com/rastikerdar/vazir-font/");
    			add_location(a3, file$4, 90, 8, 2402);
    			add_location(br5, file$4, 91, 8, 2492);
    			attr_dev(a4, "href", "https://github.com/rastikerdar/sahel-font/");
    			add_location(a4, file$4, 92, 8, 2507);
    			add_location(p3, file$4, 85, 4, 2246);
    			add_location(br6, file$4, 94, 4, 2602);
    			attr_dev(a5, "href", "https://github.com/kiamazi/borhan/issues");
    			add_location(a5, file$4, 95, 127, 2736);
    			add_location(p4, file$4, 95, 4, 2613);
    			add_location(br7, file$4, 96, 4, 2817);
    			attr_dev(div7, "class", "version svelte-rankl6");
    			add_location(div7, file$4, 97, 4, 2828);
    			attr_dev(div8, "id", "about");
    			attr_dev(div8, "class", div8_class_value = "" + (null_to_empty(/*$sideBarStatus*/ ctx[0].about ? "show" : "hide") + " svelte-rankl6"));
    			add_location(div8, file$4, 73, 0, 1717);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(informations, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(settings, div1, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h10);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, table0);
    			append_dev(table0, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, t5);
    			append_dev(tr0, td1);
    			append_dev(table0, t7);
    			append_dev(table0, tr1);
    			append_dev(tr1, td2);
    			append_dev(tr1, t9);
    			append_dev(tr1, td3);
    			append_dev(div4, t11);
    			append_dev(div4, br0);
    			append_dev(div4, t12);
    			append_dev(div4, h11);
    			append_dev(div4, t14);
    			append_dev(div4, div3);
    			append_dev(div3, table1);
    			append_dev(table1, tr2);
    			append_dev(tr2, td4);
    			append_dev(tr2, t16);
    			append_dev(tr2, td5);
    			append_dev(table1, t18);
    			append_dev(table1, tr3);
    			append_dev(tr3, td6);
    			append_dev(tr3, t20);
    			append_dev(tr3, td7);
    			append_dev(table1, t22);
    			append_dev(table1, tr4);
    			append_dev(tr4, td8);
    			append_dev(tr4, t24);
    			append_dev(tr4, td9);
    			append_dev(table1, t26);
    			append_dev(table1, tr5);
    			append_dev(tr5, td10);
    			append_dev(tr5, t28);
    			append_dev(tr5, td11);
    			append_dev(table1, t30);
    			append_dev(table1, tr6);
    			append_dev(tr6, td12);
    			append_dev(table1, t32);
    			append_dev(table1, tr7);
    			append_dev(tr7, td13);
    			append_dev(tr7, t34);
    			append_dev(tr7, td14);
    			append_dev(table1, t36);
    			append_dev(table1, tr8);
    			append_dev(tr8, td15);
    			append_dev(table1, t38);
    			append_dev(table1, tr9);
    			append_dev(tr9, td16);
    			append_dev(tr9, t40);
    			append_dev(tr9, td17);
    			append_dev(table1, t42);
    			append_dev(table1, tr10);
    			append_dev(tr10, td18);
    			append_dev(table1, t44);
    			append_dev(table1, tr11);
    			append_dev(tr11, td19);
    			append_dev(tr11, t46);
    			append_dev(tr11, td20);
    			insert_dev(target, t48, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div5);
    			append_dev(div5, img);
    			append_dev(div5, t49);
    			append_dev(div5, h12);
    			append_dev(div8, t51);
    			append_dev(div8, div6);
    			append_dev(div8, t53);
    			append_dev(div8, p0);
    			append_dev(p0, t54);
    			append_dev(p0, a0);
    			append_dev(div8, t56);
    			append_dev(div8, br1);
    			append_dev(div8, t57);
    			append_dev(div8, p1);
    			append_dev(p1, t58);
    			append_dev(p1, a1);
    			append_dev(div8, t60);
    			append_dev(div8, p2);
    			append_dev(div8, t62);
    			append_dev(div8, br2);
    			append_dev(div8, t63);
    			append_dev(div8, p3);
    			append_dev(p3, t64);
    			append_dev(p3, br3);
    			append_dev(p3, t65);
    			append_dev(p3, a2);
    			append_dev(p3, t67);
    			append_dev(p3, br4);
    			append_dev(p3, t68);
    			append_dev(p3, a3);
    			append_dev(p3, t70);
    			append_dev(p3, br5);
    			append_dev(p3, t71);
    			append_dev(p3, a4);
    			append_dev(p3, t73);
    			append_dev(div8, t74);
    			append_dev(div8, br6);
    			append_dev(div8, t75);
    			append_dev(div8, p4);
    			append_dev(p4, t76);
    			append_dev(p4, a5);
    			append_dev(div8, t78);
    			append_dev(div8, br7);
    			append_dev(div8, t79);
    			append_dev(div8, div7);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$sideBarStatus*/ 1 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*$sideBarStatus*/ ctx[0].informations ? "show" : "hide") + " svelte-rankl6"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*$sideBarStatus*/ 1 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*$sideBarStatus*/ ctx[0].settings ? "show" : "hide") + " svelte-rankl6"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*$sideBarStatus*/ 1 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$sideBarStatus*/ ctx[0].help ? "show" : "hide") + " svelte-rankl6"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}

    			if (!current || dirty & /*$sideBarStatus*/ 1 && div8_class_value !== (div8_class_value = "" + (null_to_empty(/*$sideBarStatus*/ ctx[0].about ? "show" : "hide") + " svelte-rankl6"))) {
    				attr_dev(div8, "class", div8_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(informations.$$.fragment, local);
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(informations.$$.fragment, local);
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(informations);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(settings);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t48);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $sideBarStatus;
    	validate_store(sideBarStatus, "sideBarStatus");
    	component_subscribe($$self, sideBarStatus, $$value => $$invalidate(0, $sideBarStatus = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SidePanel", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SidePanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		sideBarStatus,
    		Informations,
    		Settings,
    		$sideBarStatus
    	});

    	return [$sideBarStatus];
    }

    class SidePanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SidePanel",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    function contentController(textSelected, translateSelected, pageNumber, ayaNumberInQuran) {
        const text = require(`./assets/text/${textSelected}.js`);
        const translate = require(`./assets/translate/${translateSelected}.js`);

        const match = /(\w+)_\w+/.exec(translateSelected);
        const rtl = rtlLangs.includes(match[1]) ? true : false;
        let data = [];
        let textContent;
        for (
            let ayaNumInQuran = Page[pageNumber][2];
            ayaNumInQuran < Page[pageNumber + 1][2];
            ayaNumInQuran++
        ) {
            const suraNum = text[ayaNumInQuran][1] - 1;
            const ayaNumInSura = text[ayaNumInQuran][2];
            if (ayaNumInSura === 1 && suraNum !== 0 && suraNum !== 8) {
                textContent = text[ayaNumInQuran][3].replace(
                    /^(([^ ]+ ){4})/u,
                    ""
                );
            } else {
                textContent = text[ayaNumInQuran][3];
            }
            data.push({
                ayaNumInQuran,
                suraNum,
                ayaNumInSura,
                text: textContent,
                translate: translate[ayaNumInQuran][3],
                rtl: rtl,
                selected: ayaNumInQuran === ayaNumberInQuran ? true : false,
            });
        }
        return data
    }

    /* src/svelte/components/main/Main.svelte generated by Svelte v3.37.0 */
    const file$3 = "src/svelte/components/main/Main.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i].ayaNumInQuran;
    	child_ctx[13] = list[i].suraNum;
    	child_ctx[14] = list[i].ayaNumInSura;
    	child_ctx[15] = list[i].text;
    	child_ctx[16] = list[i].translate;
    	child_ctx[17] = list[i].rtl;
    	child_ctx[18] = list[i].selected;
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (41:8) {#if ayaNumInSura === 1}
    function create_if_block_2(ctx) {
    	let div;
    	let t0_value = Sura[/*suraNum*/ ctx[13]][4] + "";
    	let t0;
    	let div_id_value;
    	let t1;
    	let if_block_anchor;
    	let if_block = /*suraNum*/ ctx[13] !== 0 && /*suraNum*/ ctx[13] !== 8 && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "id", div_id_value = "sura" + /*suraNum*/ ctx[13]);
    			attr_dev(div, "class", "sura_name svelte-1jkwz73");
    			add_location(div, file$3, 41, 12, 1409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*textContent*/ 2 && t0_value !== (t0_value = Sura[/*suraNum*/ ctx[13]][4] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*textContent*/ 2 && div_id_value !== (div_id_value = "sura" + /*suraNum*/ ctx[13])) {
    				attr_dev(div, "id", div_id_value);
    			}

    			if (/*suraNum*/ ctx[13] !== 0 && /*suraNum*/ ctx[13] !== 8) {
    				if (if_block) ; else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(41:8) {#if ayaNumInSura === 1}",
    		ctx
    	});

    	return block;
    }

    // (45:12) {#if suraNum !== 0 && suraNum !== 8}
    function create_if_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "بِسمِ اللَّهِ الرَّحمنِ الرَّحيمِ";
    			attr_dev(div, "class", "bismillah svelte-1jkwz73");
    			add_location(div, file$3, 45, 16, 1571);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(45:12) {#if suraNum !== 0 && suraNum !== 8}",
    		ctx
    	});

    	return block;
    }

    // (56:16) {#if $showOnlyText === true || $showOnlyText === $showOnlyTranslate}
    function create_if_block_1$1(ctx) {
    	let div;
    	let t0_value = /*text*/ ctx[15] + "";
    	let t0;
    	let span;
    	let t1;
    	let t2_value = toFarsiNumber(/*ayaNumInSura*/ ctx[14]) + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			span = element("span");
    			t1 = text("(");
    			t2 = text(t2_value);
    			t3 = text(")");
    			attr_dev(span, "class", "aya_number svelte-1jkwz73");
    			add_location(span, file$3, 57, 30, 2041);
    			attr_dev(div, "class", "aya_text svelte-1jkwz73");
    			add_location(div, file$3, 56, 20, 1988);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			append_dev(span, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*textContent*/ 2 && t0_value !== (t0_value = /*text*/ ctx[15] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*textContent*/ 2 && t2_value !== (t2_value = toFarsiNumber(/*ayaNumInSura*/ ctx[14]) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(56:16) {#if $showOnlyText === true || $showOnlyText === $showOnlyTranslate}",
    		ctx
    	});

    	return block;
    }

    // (61:16) {#if $showOnlyTranslate === true || $showOnlyText === $showOnlyTranslate}
    function create_if_block$2(ctx) {
    	let div;
    	let t_value = /*translate*/ ctx[16] + "";
    	let t;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", div_class_value = "aya_translate " + (/*rtl*/ ctx[17] ? "rtl" : "ltr") + " svelte-1jkwz73");
    			add_location(div, file$3, 61, 20, 2264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*textContent*/ 2 && t_value !== (t_value = /*translate*/ ctx[16] + "")) set_data_dev(t, t_value);

    			if (dirty & /*textContent*/ 2 && div_class_value !== (div_class_value = "aya_translate " + (/*rtl*/ ctx[17] ? "rtl" : "ltr") + " svelte-1jkwz73")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(61:16) {#if $showOnlyTranslate === true || $showOnlyText === $showOnlyTranslate}",
    		ctx
    	});

    	return block;
    }

    // (40:4) {#each textContent as { ayaNumInQuran, suraNum, ayaNumInSura, text, translate, rtl, selected }
    function create_each_block(ctx) {
    	let t0;
    	let section;
    	let div;
    	let t1;
    	let div_id_value;
    	let t2;
    	let mounted;
    	let dispose;
    	let if_block0 = /*ayaNumInSura*/ ctx[14] === 1 && create_if_block_2(ctx);
    	let if_block1 = (/*$showOnlyText*/ ctx[3] === true || /*$showOnlyText*/ ctx[3] === /*$showOnlyTranslate*/ ctx[4]) && create_if_block_1$1(ctx);
    	let if_block2 = (/*$showOnlyTranslate*/ ctx[4] === true || /*$showOnlyText*/ ctx[3] === /*$showOnlyTranslate*/ ctx[4]) && create_if_block$2(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*ayaNumInQuran*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			section = element("section");
    			div = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			attr_dev(div, "id", div_id_value = "aya" + /*ayaNumInQuran*/ ctx[12]);
    			attr_dev(div, "class", "aya svelte-1jkwz73");
    			toggle_class(div, "selected", /*selected*/ ctx[18]);
    			add_location(div, file$3, 49, 12, 1696);
    			attr_dev(section, "class", "svelte-1jkwz73");
    			add_location(section, file$3, 48, 8, 1674);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(section, t2);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*ayaNumInSura*/ ctx[14] === 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$showOnlyText*/ ctx[3] === true || /*$showOnlyText*/ ctx[3] === /*$showOnlyTranslate*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$showOnlyTranslate*/ ctx[4] === true || /*$showOnlyText*/ ctx[3] === /*$showOnlyTranslate*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$2(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*textContent*/ 2 && div_id_value !== (div_id_value = "aya" + /*ayaNumInQuran*/ ctx[12])) {
    				attr_dev(div, "id", div_id_value);
    			}

    			if (dirty & /*textContent*/ 2) {
    				toggle_class(div, "selected", /*selected*/ ctx[18]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(40:4) {#each textContent as { ayaNumInQuran, suraNum, ayaNumInSura, text, translate, rtl, selected }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let each_value = /*textContent*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(main, "class", "svelte-1jkwz73");
    			toggle_class(main, "sideactive", /*$sideBarStatus*/ ctx[2].active);
    			add_location(main, file$3, 38, 0, 1210);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*textContent, $ayaNumberInQuran, $showOnlyTranslate, $showOnlyText, toFarsiNumber, Sura*/ 27) {
    				each_value = /*textContent*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(main, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$sideBarStatus*/ 4) {
    				toggle_class(main, "sideactive", /*$sideBarStatus*/ ctx[2].active);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function toFarsiNumber(n) {
    	const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    	return n.toString().replace(/\d/g, x => farsiDigits[Number(x)]);
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let textContent;
    	let $textFontSize;
    	let $translateFontSize;
    	let $textSelected;
    	let $translateSelected;
    	let $pageNumber;
    	let $ayaNumberInQuran;
    	let $suraNumber;
    	let $sideBarStatus;
    	let $showOnlyText;
    	let $showOnlyTranslate;
    	validate_store(textFontSize, "textFontSize");
    	component_subscribe($$self, textFontSize, $$value => $$invalidate(5, $textFontSize = $$value));
    	validate_store(translateFontSize, "translateFontSize");
    	component_subscribe($$self, translateFontSize, $$value => $$invalidate(6, $translateFontSize = $$value));
    	validate_store(textSelected, "textSelected");
    	component_subscribe($$self, textSelected, $$value => $$invalidate(7, $textSelected = $$value));
    	validate_store(translateSelected, "translateSelected");
    	component_subscribe($$self, translateSelected, $$value => $$invalidate(8, $translateSelected = $$value));
    	validate_store(pageNumber, "pageNumber");
    	component_subscribe($$self, pageNumber, $$value => $$invalidate(9, $pageNumber = $$value));
    	validate_store(ayaNumberInQuran, "ayaNumberInQuran");
    	component_subscribe($$self, ayaNumberInQuran, $$value => $$invalidate(0, $ayaNumberInQuran = $$value));
    	validate_store(suraNumber, "suraNumber");
    	component_subscribe($$self, suraNumber, $$value => $$invalidate(11, $suraNumber = $$value));
    	validate_store(sideBarStatus, "sideBarStatus");
    	component_subscribe($$self, sideBarStatus, $$value => $$invalidate(2, $sideBarStatus = $$value));
    	validate_store(showOnlyText, "showOnlyText");
    	component_subscribe($$self, showOnlyText, $$value => $$invalidate(3, $showOnlyText = $$value));
    	validate_store(showOnlyTranslate, "showOnlyTranslate");
    	component_subscribe($$self, showOnlyTranslate, $$value => $$invalidate(4, $showOnlyTranslate = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Main", slots, []);

    	afterUpdate(async () => {
    		const ayaNumberInSura = Number($ayaNumberInQuran) - Sura[$suraNumber][0] + 1;

    		if (ayaNumberInSura === 1) {
    			document.getElementById("sura" + $suraNumber).scrollIntoView({ behavior: "smooth" });
    		} else {
    			document.getElementById("aya" + $ayaNumberInQuran).scrollIntoView({ behavior: "smooth" });
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	const click_handler = ayaNumInQuran => set_store_value(ayaNumberInQuran, $ayaNumberInQuran = ayaNumInQuran, $ayaNumberInQuran);

    	$$self.$capture_state = () => ({
    		ayaNumberInQuran,
    		suraNumber,
    		pageNumber,
    		textSelected,
    		translateSelected,
    		showOnlyText,
    		showOnlyTranslate,
    		textFontSize,
    		translateFontSize,
    		sideBarStatus,
    		Sura,
    		contentController,
    		afterUpdate,
    		toFarsiNumber,
    		$textFontSize,
    		$translateFontSize,
    		textContent,
    		$textSelected,
    		$translateSelected,
    		$pageNumber,
    		$ayaNumberInQuran,
    		$suraNumber,
    		$sideBarStatus,
    		$showOnlyText,
    		$showOnlyTranslate
    	});

    	$$self.$inject_state = $$props => {
    		if ("textContent" in $$props) $$invalidate(1, textContent = $$props.textContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$textFontSize, $translateFontSize*/ 96) {
    			{
    				document.documentElement.style.setProperty("--text-size", $textFontSize + "px");
    				document.documentElement.style.setProperty("--translate-size", $translateFontSize + "px");
    			}
    		}

    		if ($$self.$$.dirty & /*$textSelected, $translateSelected, $pageNumber, $ayaNumberInQuran*/ 897) {
    			$$invalidate(1, textContent = contentController($textSelected, $translateSelected, $pageNumber, $ayaNumberInQuran));
    		}
    	};

    	return [
    		$ayaNumberInQuran,
    		textContent,
    		$sideBarStatus,
    		$showOnlyText,
    		$showOnlyTranslate,
    		$textFontSize,
    		$translateFontSize,
    		$textSelected,
    		$translateSelected,
    		$pageNumber,
    		click_handler
    	];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/svelte/components/main/Pagination.svelte generated by Svelte v3.37.0 */
    const file$2 = "src/svelte/components/main/Pagination.svelte";

    // (17:8) {#if $pageNumber < 603}
    function create_if_block_1(ctx) {
    	let button;
    	let t0;
    	let b;
    	let button_value_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text("next page ");
    			b = element("b");
    			b.textContent = "«";
    			attr_dev(b, "class", "btn svelte-9pxe2p");
    			add_location(b, file$2, 22, 26, 744);
    			button.value = button_value_value = /*$pageNumber*/ ctx[4] + 1;
    			attr_dev(button, "class", "svelte-9pxe2p");
    			add_location(button, file$2, 17, 12, 537);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, b);
    			/*button_binding*/ ctx[5](button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$pageNumber*/ 16 && button_value_value !== (button_value_value = /*$pageNumber*/ ctx[4] + 1)) {
    				prop_dev(button, "value", button_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			/*button_binding*/ ctx[5](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(17:8) {#if $pageNumber < 603}",
    		ctx
    	});

    	return block;
    }

    // (29:8) {#if $pageNumber > 0}
    function create_if_block$1(ctx) {
    	let button;
    	let b;
    	let t1;
    	let button_value_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			b = element("b");
    			b.textContent = "»";
    			t1 = text(" prev page");
    			attr_dev(b, "class", "btn svelte-9pxe2p");
    			add_location(b, file$2, 34, 16, 1086);
    			button.value = button_value_value = /*$pageNumber*/ ctx[4] - 1;
    			attr_dev(button, "class", "svelte-9pxe2p");
    			add_location(button, file$2, 29, 12, 889);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, b);
    			append_dev(button, t1);
    			/*button_binding_1*/ ctx[7](button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$pageNumber*/ 16 && button_value_value !== (button_value_value = /*$pageNumber*/ ctx[4] - 1)) {
    				prop_dev(button, "value", button_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			/*button_binding_1*/ ctx[7](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(29:8) {#if $pageNumber > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let pageselector;
    	let current;
    	let if_block0 = /*$pageNumber*/ ctx[4] < 603 && create_if_block_1(ctx);
    	let if_block1 = /*$pageNumber*/ ctx[4] > 0 && create_if_block$1(ctx);
    	pageselector = new PageSelector({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div2 = element("div");
    			t2 = text("page ");
    			create_component(pageselector.$$.fragment);
    			attr_dev(div0, "class", "prev-next svelte-9pxe2p");
    			add_location(div0, file$2, 15, 4, 469);
    			attr_dev(div1, "class", "prev-next svelte-9pxe2p");
    			add_location(div1, file$2, 27, 4, 823);
    			attr_dev(div2, "class", "selector");
    			add_location(div2, file$2, 39, 4, 1175);
    			attr_dev(section, "id", "pagination");
    			attr_dev(section, "class", "svelte-9pxe2p");
    			toggle_class(section, "sideactive", /*$sideBarStatus*/ ctx[3].active);
    			add_location(section, file$2, 14, 0, 398);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(section, t0);
    			append_dev(section, div1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(section, t1);
    			append_dev(section, div2);
    			append_dev(div2, t2);
    			mount_component(pageselector, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$pageNumber*/ ctx[4] < 603) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$pageNumber*/ ctx[4] > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*$sideBarStatus*/ 8) {
    				toggle_class(section, "sideactive", /*$sideBarStatus*/ ctx[3].active);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pageselector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pageselector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(pageselector);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $ayaNumberInQuran;
    	let $sideBarStatus;
    	let $pageNumber;
    	validate_store(ayaNumberInQuran, "ayaNumberInQuran");
    	component_subscribe($$self, ayaNumberInQuran, $$value => $$invalidate(0, $ayaNumberInQuran = $$value));
    	validate_store(sideBarStatus, "sideBarStatus");
    	component_subscribe($$self, sideBarStatus, $$value => $$invalidate(3, $sideBarStatus = $$value));
    	validate_store(pageNumber, "pageNumber");
    	component_subscribe($$self, pageNumber, $$value => $$invalidate(4, $pageNumber = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pagination", slots, []);
    	let sajda; // number;
    	let prevButton; // HTMLButtonElement;
    	let nextButton; // HTMLButtonElement;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pagination> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			nextButton = $$value;
    			$$invalidate(2, nextButton);
    		});
    	}

    	const click_handler = () => set_store_value(ayaNumberInQuran, $ayaNumberInQuran = Page[$pageNumber + 1][2], $ayaNumberInQuran);

    	function button_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			prevButton = $$value;
    			$$invalidate(1, prevButton);
    		});
    	}

    	const click_handler_1 = () => set_store_value(ayaNumberInQuran, $ayaNumberInQuran = Page[$pageNumber - 1][2], $ayaNumberInQuran);

    	$$self.$capture_state = () => ({
    		PageSelector,
    		ayaNumberInQuran,
    		pageNumber,
    		sideBarStatus,
    		Sajda,
    		Page,
    		sajda,
    		prevButton,
    		nextButton,
    		$ayaNumberInQuran,
    		$sideBarStatus,
    		$pageNumber
    	});

    	$$self.$inject_state = $$props => {
    		if ("sajda" in $$props) sajda = $$props.sajda;
    		if ("prevButton" in $$props) $$invalidate(1, prevButton = $$props.prevButton);
    		if ("nextButton" in $$props) $$invalidate(2, nextButton = $$props.nextButton);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$ayaNumberInQuran*/ 1) {
    			{
    				sajda = Sajda.map(array => array[3]).indexOf(Number($ayaNumberInQuran));
    			}
    		}
    	};

    	return [
    		$ayaNumberInQuran,
    		prevButton,
    		nextButton,
    		$sideBarStatus,
    		$pageNumber,
    		button_binding,
    		click_handler,
    		button_binding_1,
    		click_handler_1
    	];
    }

    class Pagination extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pagination",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/svelte/StatusLine.svelte generated by Svelte v3.37.0 */
    const file$1 = "src/svelte/StatusLine.svelte";

    // (13:4) {#if sajdaType !== -1}
    function create_if_block(ctx) {
    	let span;
    	let t0;
    	let t1_value = Sajda[/*sajdaType*/ ctx[2]][2] + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("sajda ");
    			t1 = text(t1_value);
    			t2 = text(" ۩");
    			attr_dev(span, "class", "svelte-1i5z3tr");
    			add_location(span, file$1, 13, 8, 531);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sajdaType*/ 4 && t1_value !== (t1_value = Sajda[/*sajdaType*/ ctx[2]][2] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(13:4) {#if sajdaType !== -1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let span0;
    	let t0;
    	let t1_value = /*$juzNumber*/ ctx[3] + 1 + "";
    	let t1;
    	let t2;
    	let span1;
    	let t3;
    	let t4_value = /*$hizbNumber*/ ctx[4] + 1 + "";
    	let t4;
    	let t5;
    	let span2;
    	let t6;
    	let t7_value = Sura[/*$suraNumber*/ ctx[0]][5] + "";
    	let t7;
    	let t8;
    	let t9_value = Sura[/*$suraNumber*/ ctx[0]][4] + "";
    	let t9;
    	let t10;
    	let t11;
    	let span3;
    	let t12;
    	let t13;
    	let t14;
    	let if_block = /*sajdaType*/ ctx[2] !== -1 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text("juz: ");
    			t1 = text(t1_value);
    			t2 = space();
    			span1 = element("span");
    			t3 = text("hizb: ");
    			t4 = text(t4_value);
    			t5 = space();
    			span2 = element("span");
    			t6 = text("sura: ");
    			t7 = text(t7_value);
    			t8 = text("(");
    			t9 = text(t9_value);
    			t10 = text(")");
    			t11 = space();
    			span3 = element("span");
    			t12 = text("aya: ");
    			t13 = text(/*ayaNumberInSura*/ ctx[1]);
    			t14 = space();
    			if (if_block) if_block.c();
    			attr_dev(span0, "class", "svelte-1i5z3tr");
    			add_location(span0, file$1, 8, 4, 310);
    			attr_dev(span1, "class", "svelte-1i5z3tr");
    			add_location(span1, file$1, 9, 4, 349);
    			attr_dev(span2, "class", "svelte-1i5z3tr");
    			add_location(span2, file$1, 10, 4, 390);
    			attr_dev(span3, "class", "svelte-1i5z3tr");
    			add_location(span3, file$1, 11, 4, 460);
    			attr_dev(div, "id", "statusline");
    			attr_dev(div, "class", "svelte-1i5z3tr");
    			add_location(div, file$1, 7, 0, 284);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			append_dev(span1, t3);
    			append_dev(span1, t4);
    			append_dev(div, t5);
    			append_dev(div, span2);
    			append_dev(span2, t6);
    			append_dev(span2, t7);
    			append_dev(span2, t8);
    			append_dev(span2, t9);
    			append_dev(span2, t10);
    			append_dev(div, t11);
    			append_dev(div, span3);
    			append_dev(span3, t12);
    			append_dev(span3, t13);
    			append_dev(div, t14);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$juzNumber*/ 8 && t1_value !== (t1_value = /*$juzNumber*/ ctx[3] + 1 + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$hizbNumber*/ 16 && t4_value !== (t4_value = /*$hizbNumber*/ ctx[4] + 1 + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*$suraNumber*/ 1 && t7_value !== (t7_value = Sura[/*$suraNumber*/ ctx[0]][5] + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*$suraNumber*/ 1 && t9_value !== (t9_value = Sura[/*$suraNumber*/ ctx[0]][4] + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*ayaNumberInSura*/ 2) set_data_dev(t13, /*ayaNumberInSura*/ ctx[1]);

    			if (/*sajdaType*/ ctx[2] !== -1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let ayaNumberInSura;
    	let sajdaType;
    	let $ayaNumberInQuran;
    	let $suraNumber;
    	let $juzNumber;
    	let $hizbNumber;
    	validate_store(ayaNumberInQuran, "ayaNumberInQuran");
    	component_subscribe($$self, ayaNumberInQuran, $$value => $$invalidate(5, $ayaNumberInQuran = $$value));
    	validate_store(suraNumber, "suraNumber");
    	component_subscribe($$self, suraNumber, $$value => $$invalidate(0, $suraNumber = $$value));
    	validate_store(juzNumber, "juzNumber");
    	component_subscribe($$self, juzNumber, $$value => $$invalidate(3, $juzNumber = $$value));
    	validate_store(hizbNumber, "hizbNumber");
    	component_subscribe($$self, hizbNumber, $$value => $$invalidate(4, $hizbNumber = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("StatusLine", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StatusLine> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Sura,
    		Sajda,
    		suraNumber,
    		juzNumber,
    		hizbNumber,
    		ayaNumberInQuran,
    		ayaNumberInSura,
    		$ayaNumberInQuran,
    		$suraNumber,
    		sajdaType,
    		$juzNumber,
    		$hizbNumber
    	});

    	$$self.$inject_state = $$props => {
    		if ("ayaNumberInSura" in $$props) $$invalidate(1, ayaNumberInSura = $$props.ayaNumberInSura);
    		if ("sajdaType" in $$props) $$invalidate(2, sajdaType = $$props.sajdaType);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$ayaNumberInQuran, $suraNumber*/ 33) {
    			$$invalidate(1, ayaNumberInSura = $ayaNumberInQuran - Sura[$suraNumber][0] + 1);
    		}

    		if ($$self.$$.dirty & /*$ayaNumberInQuran*/ 32) {
    			$$invalidate(2, sajdaType = Sajda.map(array => array[3]).indexOf($ayaNumberInQuran));
    		}
    	};

    	return [
    		$suraNumber,
    		ayaNumberInSura,
    		sajdaType,
    		$juzNumber,
    		$hizbNumber,
    		$ayaNumberInQuran
    	];
    }

    class StatusLine extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StatusLine",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/svelte/App.svelte generated by Svelte v3.37.0 */
    const file = "src/svelte/App.svelte";

    function create_fragment(ctx) {
    	let t0;
    	let sidenav0;
    	let t1;
    	let sidepanel0;
    	let t2;
    	let main;
    	let t3;
    	let pagination;
    	let t4;
    	let statusline;
    	let t5;
    	let sidepanel1;
    	let t6;
    	let sidenav1;
    	let t7;
    	let topnav;
    	let t8;
    	let toppanel;
    	let t9;
    	let pager;
    	let t10;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;
    	sidenav0 = new SideNav({ $$inline: true });
    	sidepanel0 = new SidePanel({ $$inline: true });
    	main = new Main({ $$inline: true });
    	pagination = new Pagination({ $$inline: true });
    	statusline = new StatusLine({ $$inline: true });

    	const block = {
    		c: function create() {
    			t0 = space();
    			create_component(sidenav0.$$.fragment);
    			t1 = space();
    			create_component(sidepanel0.$$.fragment);
    			t2 = space();
    			create_component(main.$$.fragment);
    			t3 = space();
    			create_component(pagination.$$.fragment);
    			t4 = space();
    			create_component(statusline.$$.fragment);
    			t5 = space();
    			sidepanel1 = element("sidepanel");
    			t6 = space();
    			sidenav1 = element("sidenav");
    			t7 = space();
    			topnav = element("topnav");
    			t8 = space();
    			toppanel = element("toppanel");
    			t9 = space();
    			pager = element("pager");
    			t10 = space();
    			footer = element("footer");
    			add_location(sidepanel1, file, 44, 0, 1200);
    			add_location(sidenav1, file, 45, 0, 1224);
    			add_location(topnav, file, 46, 0, 1244);
    			add_location(toppanel, file, 46, 35, 1279);
    			add_location(pager, file, 48, 0, 1324);
    			add_location(footer, file, 49, 0, 1340);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(sidenav0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(sidepanel0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(main, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(pagination, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(statusline, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, sidepanel1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, sidenav1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, topnav, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, toppanel, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, pager, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, footer, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(document.body, "keydown", /*keyShortcuts*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidenav0.$$.fragment, local);
    			transition_in(sidepanel0.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			transition_in(pagination.$$.fragment, local);
    			transition_in(statusline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidenav0.$$.fragment, local);
    			transition_out(sidepanel0.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			transition_out(pagination.$$.fragment, local);
    			transition_out(statusline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(sidenav0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(sidepanel0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(main, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(pagination, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(statusline, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(sidepanel1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(sidenav1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(topnav);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(toppanel);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(pager);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(footer);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $pageNumber;
    	let $ayaNumberInQuran;
    	validate_store(pageNumber, "pageNumber");
    	component_subscribe($$self, pageNumber, $$value => $$invalidate(1, $pageNumber = $$value));
    	validate_store(ayaNumberInQuran, "ayaNumberInQuran");
    	component_subscribe($$self, ayaNumberInQuran, $$value => $$invalidate(2, $ayaNumberInQuran = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	function keyShortcuts(event) {
    		if (event.key === "ArrowRight") {
    			event.preventDefault();
    			if ($pageNumber === 0) return;
    			set_store_value(ayaNumberInQuran, $ayaNumberInQuran = Page[$pageNumber - 1][2], $ayaNumberInQuran);
    		} else if (event.key === "ArrowLeft") {
    			event.preventDefault();
    			if ($pageNumber === 603) return;
    			set_store_value(ayaNumberInQuran, $ayaNumberInQuran = Page[$pageNumber + 1][2], $ayaNumberInQuran);
    		} else if (event.key === "ArrowUp") {
    			event.preventDefault();
    			if (Number($ayaNumberInQuran) === 0) return;
    			set_store_value(ayaNumberInQuran, $ayaNumberInQuran = Number($ayaNumberInQuran) - 1, $ayaNumberInQuran);
    		} else if (event.key === "ArrowDown") {
    			event.preventDefault();
    			if (Number($ayaNumberInQuran) === 6235) return;
    			set_store_value(ayaNumberInQuran, $ayaNumberInQuran = Number($ayaNumberInQuran) + 1, $ayaNumberInQuran);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		pageNumber,
    		ayaNumberInQuran,
    		Page,
    		SideNav,
    		SidePanel,
    		Main,
    		Pagination,
    		StatusLine,
    		keyShortcuts,
    		$pageNumber,
    		$ayaNumberInQuran
    	});

    	return [keyShortcuts];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    //import * as Data from "../utils/quran-data";

    const app = new App({
    	target: document.body,
    //	props: {
    //		Sura: Data.Sura,
    //		getSuraNumber: Data.getSuraNumber,
    //		Page: Data.Page,
    //		getPageNumber: Data.getPageNumber,
    //		Juz: Data.Juz,
    //		getJuzNumber: Data.getJuzNumber,
    //		Hizb: Data.Hizb,
    //		getHizbNumber: Data.getHizbNumber,
    //		Sajda: Data.Sajda,
    //		Translates: Data.translatesList,
    //		Languages: Data.languagesList,
    //		RTL: Data.rtlLangs
    //	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
