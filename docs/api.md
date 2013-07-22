### `GET /events`

    {
      events: [
        {
          id:           <int>,
          title:        <string>,
          description:  <string> | null,
          address:      <string>,
          latitude:     <float>,
          longitude:    <float>,
          attendees:    <int>,
          beginDate:    "mm/dd/yyyy" | null,
          endDate:      "mm/dd/yyyy" | null,
          beginTime:    "hh:mm(a|p)m" | null,
          endTime:      "hh:mm(a|p)m" | null,
          registerLink: <url> | null,
          picture:      <url> | null,
          organizerId:  <string>,
          featured:     <bool>
        }
      ]
    }

### `POST /events`

    {
      event: {
        title:        <string>,
        description:  <string> | null,
        address:      <string>,
        //latitude:     <int>,
        //longitude:    <int>,
        attendees:    <int>,
        beginDate:    "mm/dd/yyyy" | null,
        endDate:      "mm/dd/yyyy" | null,
        beginTime:    "hh:mm(a|p)m" | null,
        endTime:      "hh:mm(a|p)m" | null,
        registerLink: <url> | null,
        //picture:      <url> | null,
      }
    }
