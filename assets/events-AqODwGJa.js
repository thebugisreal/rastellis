import{u as c,r as h,n as a}from"./index-BWeMscSV.js";import{i as _}from"./intersection-watcher-CQpC-SnO.js";import{d as i}from"./delay-offset-WNpokWIU.js";import{s as r}from"./shouldAnimate-UBwZO_aC.js";import"./media-queries-CokWIw5y.js";const o={headerItems:".animation--section-introduction > *",eventItems:".event-item"},v=e=>{i(e,[o.headerItems]);const t=_(e,!0);function n(){i(e,[o.eventItems]),setTimeout(()=>{c(e,"animate-event-items")},50)}return{animateEventItems:n,destroy(){t==null||t.destroy()}}},m={listContainer:"[data-events-eventbrite-container]",skeletonList:".events__list--skeleton"},l={org:e=>`https://www.eventbriteapi.com//v3/users/me/organizations/?token=${e}`,events:(e,t)=>`https://www.eventbriteapi.com//v3/organizations/${e}/events/?token=${t}&expand=venue&status=live`};h("events",{onLoad(){this.accessToken=this.container.dataset.accessToken,this.eventCount=parseInt(this.container.dataset.eventCount,10),this.imageAspectRatio=this.container.dataset.imageAspectRatio,this.learnMoreText=this.container.dataset.learnMoreText,this._fetchOrg(),r(this.container)&&(this.animateEvents=v(this.container),this.accessToken||this.animateEvents.animateEventItems())},_fetchOrg(){this.accessToken&&fetch(l.org(this.accessToken)).then(e=>e.json()).then(e=>{this._fetchEvents(e.organizations[0].id)})},_fetchEvents(e){e&&fetch(l.events(e,this.accessToken)).then(t=>t.json()).then(t=>{this._renderEvents(t.events)})},_renderEvents(e){const t=a(m.listContainer,this.container),n=a(m.skeletonList,this.container);let s=document.createElement("ul");s.className="events__list",e.slice(0,this.eventCount).forEach(d=>{s.innerHTML+=this._renderEventItem(d)}),c(n,"hide"),setTimeout(()=>{t.textContent="",t.appendChild(s),r(this.container)&&this.animateEvents.animateEventItems()},300)},_renderEventItem(e){var n;return`
      <li
        class="
          event-item
          event-item--eventbrite
          ${(n=e.logo)!=null&&n.url?"event-item--has-image":""}
        "
      >
        <a href="${e.url}" class="event-item__link">
          <div class="event-item__image-wrapper">
            ${this._renderImage(e)}
            ${this._renderDateBadge(e)}
          </div>
          <div class="event-item__details">
            ${this._renderName(e)}
            ${this._renderDate(e)}
            ${this._renderVenue(e)}
            ${this._renderSummary(e)}
            <span class="btn btn--callout event-item__callout">
              <span>${this.learnMoreText}</span>
            </span>
          </div>
        </a>
      </li>
    `},_renderImage(e){var n;let t="";return(n=e.logo)!=null&&n.url&&(t=`
        <div class="image ${this.imageAspectRatio} event-item__image image--animate animation--lazy-load">
          <img
            src="${e.logo.url}"
            alt="${e.name.text}"
            loading="lazy"
            class="image__img"
            onload="javascript: this.closest('.image').classList.add('loaded')"
          >
        </div>
      `),t},_renderDateBadge(e){var n;let t="";if((n=e.start)!=null&&n.local){const s=new Date(e.start.local);t=`
        <span class="event-item__date-badge">
          <span class="event-item__date-badge-day fs-body-bold fs-body-200">
            ${new Intl.DateTimeFormat([],{day:"numeric"}).format(s)}
          </span>
          <span class="event-item__date-badge-month fs-accent">
            ${new Intl.DateTimeFormat([],{month:"short"}).format(s)}
          </span>
        </span>
      `}return t},_renderName(e){var n;let t="";return(n=e.name)!=null&&n.text&&(t=`
        <h4 class="event-item__name ff-heading fs-heading-5-base">
          ${e.name.text}
        </h4>
      `),t},_renderDate(e){var n;let t="";if((n=e.start)!=null&&n.local){const s=new Date(e.start.local);t=`
        <p class="event-item__date fs-body-75">
          ${s.toLocaleDateString([],{weekday:"short",year:"numeric",month:"short",day:"numeric"})}
          ${s.toLocaleTimeString([],{timeZone:e.start.timezone,hour:"numeric",minute:"2-digit"})}
        </p>
      `}return t},_renderVenue(e){var n;let t="";return(n=e.venue)!=null&&n.name&&(t=`
        <p class="event-item__venue fs-body-75">
          ${e.venue.name}
        </p>
      `),t},_renderSummary(e){let t="";return e.summary&&(t=`
        <p class="event-item__summary">
          ${e.summary}
        </p>
      `),t},onUnload(){var e;(e=this.animateEvents)==null||e.destroy()}});
