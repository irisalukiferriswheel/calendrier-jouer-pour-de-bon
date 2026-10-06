const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.className = "";
    this.textContent = "";
    this.classList = { toggle() {}, remove() {} };
  }
  append(...children) { this.children.push(...children); }
  set innerHTML(value) { this.children = []; this._innerHTML = value; }
  get innerHTML() { return this._innerHTML || ""; }
}

function descendants(node) {
  return [node, ...node.children.flatMap(descendants)];
}

test("uses nested availability and the canonical Wix registration route", () => {
  const window = {};
  const context = {
    window,
    document: { createElement: tagName => new FakeElement(tagName) },
    Intl,
    Map,
    URLSearchParams
  };
  vm.runInNewContext(fs.readFileSync("render.js", "utf8"), context);

  const events = new FakeElement("div");
  const st = {
    loading: false,
    demo: false,
    loadFailed: false,
    city: "",
    game: "",
    search: "",
    range: "all",
    events: [{
      id: "event-1",
      competitionId: "competition-1",
      title: "Open event",
      startAt: "2099-10-23T00:00:00Z",
      timezone: "America/Toronto",
      city: "Granby",
      games: ["Go"],
      availability: {
        maxParticipants: 20,
        participantsCount: 0,
        spotsLeft: 20,
        registrationOpen: true,
        minAge: null,
        maxAge: null
      }
    }]
  };
  const labels = {
    oneResult: "1 activity",
    manyResults: "{count} activities",
    players: "players",
    spotsLeft: "spots left",
    ageGroup: "Age",
    allAges: "All ages",
    locationFallback: "TBD",
    join: "Join",
    scheduled: "Upcoming",
    noEvents: "None"
  };
  const renderer = window.JPDBCalendarRender({
    st,
    el: {
      events,
      count: new FakeElement("p"),
      msg: new FakeElement("p"),
      note: new FakeElement("p")
    },
    t: key => labels[key] || key,
    norm: value => String(value || "").toLowerCase(),
    cfg: { tz: "America/Toronto" }
  });

  renderer.render();
  let nodes = descendants(events);
  const join = nodes.find(node => node.className === "join-button");
  assert.equal(join.href, "https://www.jouerpourdebon.ca/competitions?jpdbEvent=event-1");
  assert.equal(join.target, "_top");
  assert.ok(nodes.some(node => node.textContent === "20 spots left"));

  st.events[0].availability.spotsLeft = 0;
  renderer.render();
  nodes = descendants(events);
  assert.equal(nodes.some(node => node.tagName === "a"), false);
  assert.ok(nodes.some(node => node.textContent === "full"));
  st.events[0].availability.spotsLeft = null;
  st.events[0].availability.registrationOpen = false;
  renderer.render();
  nodes = descendants(events);
  assert.equal(nodes.some(node => node.tagName === "a"), false);
  assert.ok(nodes.some(node => node.textContent === "registrationClosed"));
  st.events[0].availability.spotsLeft = 20;
  st.events[0].availability.registrationOpen = true;
  st.demo = true;
  renderer.render();
  const demoJoin = descendants(events).find(node => node.className === "join-button");
  assert.match(demoJoin.href, /^join\/\?/);
  assert.match(demoJoin.href, /demo=1/);
  assert.equal(demoJoin.target, undefined);
});
