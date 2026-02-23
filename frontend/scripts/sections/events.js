import { qs, add } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import animateEvents from '@/scripts/lib/animation/events'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  listContainer: '[data-events-eventbrite-container]',
  skeletonList: '.events__list--skeleton',
}
const endpoints = {
  org: (token) =>
    `https://www.eventbriteapi.com//v3/users/me/organizations/?token=${token}`,
  events: (id, token) =>
    `https://www.eventbriteapi.com//v3/organizations/${id}/events/?token=${token}&expand=venue&status=live`,
}

section('events', {
  onLoad() {
    this.accessToken = this.container.dataset.accessToken
    this.eventCount = parseInt(this.container.dataset.eventCount, 10)
    this.imageAspectRatio = this.container.dataset.imageAspectRatio
    this.learnMoreText = this.container.dataset.learnMoreText

    this._fetchOrg()

    if (shouldAnimate(this.container)) {
      this.animateEvents = animateEvents(this.container)
      if (!this.accessToken) this.animateEvents.animateEventItems()
    }
  },

  /**
   * _fetchOrg gets the eventbrite organization data for this user
   */
  _fetchOrg() {
    if (!this.accessToken) return

    fetch(endpoints.org(this.accessToken))
      .then((res) => res.json())
      .then((res) => {
        this._fetchEvents(res.organizations[0].id)
      })
  },

  /**
   * _fetchEvents gets the eventbrite events for this user
   * @param {number} id organization id
   */
  _fetchEvents(id) {
    if (!id) return

    fetch(endpoints.events(id, this.accessToken))
      .then((res) => res.json())
      .then((events) => {
        this._renderEvents(events.events)
      })
  },

  /**
   * _renderEvents adds the event elements on the page
   * @param {array} events array of event objects
   */
  _renderEvents(events) {
    const listContainer = qs(selectors.listContainer, this.container)
    const skeletonList = qs(selectors.skeletonList, this.container)

    // Build a list of events
    let list = document.createElement('ul')
    list.className = 'events__list'
    events.slice(0, this.eventCount).forEach((event) => {
      list.innerHTML += this._renderEventItem(event)
    })

    // Append the list to the container on the page
    add(skeletonList, 'hide')
    setTimeout(() => {
      listContainer.textContent = ''
      listContainer.appendChild(list)

      if (shouldAnimate(this.container)) {
        this.animateEvents.animateEventItems()
      }
    }, 300)
  },

  /**
   * _renderEventItem builds the html needed for an event item with the event data
   * @param {obj} event the event data
   * @returns eventItem
   */
  _renderEventItem(event) {
    let eventItem = `
      <li
        class="
          event-item
          event-item--eventbrite
          ${event.logo?.url ? 'event-item--has-image' : ''}
        "
      >
        <a href="${event.url}" class="event-item__link">
          <div class="event-item__image-wrapper">
            ${this._renderImage(event)}
            ${this._renderDateBadge(event)}
          </div>
          <div class="event-item__details">
            ${this._renderName(event)}
            ${this._renderDate(event)}
            ${this._renderVenue(event)}
            ${this._renderSummary(event)}
            <span class="btn btn--callout event-item__callout">
              <span>${this.learnMoreText}</span>
            </span>
          </div>
        </a>
      </li>
    `

    return eventItem
  },

  _renderImage(event) {
    let image = ''
    if (event.logo?.url) {
      image = `
        <div class="image ${this.imageAspectRatio} event-item__image image--animate animation--lazy-load">
          <img
            src="${event.logo.url}"
            alt="${event.name.text}"
            loading="lazy"
            class="image__img"
            onload="javascript: this.closest('.image').classList.add('loaded')"
          >
        </div>
      `
    }
    return image
  },

  _renderDateBadge(event) {
    let html = ''
    if (event.start?.local) {
      const date = new Date(event.start.local)
      html = `
        <span class="event-item__date-badge">
          <span class="event-item__date-badge-day fs-body-bold fs-body-200">
            ${new Intl.DateTimeFormat([], { day: 'numeric' }).format(date)}
          </span>
          <span class="event-item__date-badge-month fs-accent">
            ${new Intl.DateTimeFormat([], { month: 'short' }).format(date)}
          </span>
        </span>
      `
    }

    return html
  },

  _renderName(event) {
    let html = ''

    if (event.name?.text) {
      html = `
        <h4 class="event-item__name ff-heading fs-heading-5-base">
          ${event.name.text}
        </h4>
      `
    }

    return html
  },

  _renderDate(event) {
    let html = ''
    if (event.start?.local) {
      const date = new Date(event.start.local)
      html = `
        <p class="event-item__date fs-body-75">
          ${date.toLocaleDateString([], {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
          ${date.toLocaleTimeString([], {
            timeZone: event.start.timezone,
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      `
    }

    return html
  },

  _renderVenue(event) {
    let html = ''
    if (event.venue?.name) {
      html = `
        <p class="event-item__venue fs-body-75">
          ${event.venue.name}
        </p>
      `
    }
    return html
  },

  _renderSummary(event) {
    let html = ''
    if (event.summary) {
      html = `
        <p class="event-item__summary">
          ${event.summary}
        </p>
      `
    }
    return html
  },

  onUnload() {
    this.animateEvents?.destroy()
  },
})
