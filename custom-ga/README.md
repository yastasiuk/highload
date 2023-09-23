# HW4 - Monitoring systems for user metrics

Exchange rate for current moment is taken from [NBU API](https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json)

### Exchange rate format
```typescript
type ExchangeRate = {
  r030: number; // Currency rate number
  txt: string; // Currency in cyrylic format: "Австралійський долар"
  rate: number; // Currency rate
  cc: string; // currency slug
  exchangedate: string; // exchange rate
}

// e.g.
const rate: ExchangeRate = {
  r030: 36,
  txt: "Австралійський долар",
  rate: 23.382,
  cc: "AUD",
  exchangedate: "11.09.2023"
};
```

### How to start
This command will start docker container with cron job to fetch exchange rates from NBU api every 5 minutes and send them to ga. 
```bash
docker build -t my_node_cron_container .
docker run my_node_cron_container
```


### Troubleshooting
1. Docker does not stop? Stop it via
```bash
docker stop <container-id>
```

### GA Report
[GA Report](https://analytics.google.com/analytics/web/#/analysis/p406276117/edit/EuabBxWfTrCMBqAqJ_RPzA)
