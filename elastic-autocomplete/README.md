# Elastic Index & Autocomplete

## Problem
Create ES index that will serve autocomplete needs with leveraging typos and errors (max 3 typos if word length is bigger than 7).

## Possible solutions
1. Use [Fuzzy query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html) - ideal candidate for leveraging typos, thought max amount of supported types - **2**;
2. Use [N-gram](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-ngram-tokenizer.html) tokenizer - solves problem with number of typos, but ideally we need multiple indexes to handle words with different length:<br>
    _Problem_:<br>
    _ngram=[1, 4]_ - would work for words with length <7, but for bigger words would allow making more errors, e.g.<br>
    Dictionary word: **wunschpunsch**:<br>
    1-grams: w, u, n, s, c, h, p, u, n, s, c, h<br>
    2-grams: wu, un, ns, sc, ch, hp, pu, un, ns, sc, ch<br>
    3-grams: wun, uns, nsc, sch, hpu, pun, uns, nsc, sch<br>
    4-grams: wuns, unsc, nsch, hpun, puns, unsc, nsch<br>
    If we match **wunshborsh** could return **wunschpunsch** though there are more than 3 errors and to handle this uses case we'd need to create separate indexes for larger words or manually reject words with low word similarity.<br>  
    _Potential Solution_: we can have multiple indexes for different word sizes and try utilizing "min_score" to prevent non-relevant suggestions. But overall we cannot allow "max 3 typos"
3. Combine **fuzziness** and **n-gram**. Assuming that fuzziness will always work for 2 typos - we need to handle "1 more". In that case we can assume that most [1-3] ngrams will be handled by fuzziness, while we need to handle other bigger ngrams
4. Utilizing some advances function indexes e.g. [kNN](https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search-api.html)

### How to
1. Start docker
```bash
docker-compose up --build
```
2. Add indexes
```bash
curl -X PUT "localhost:9200/lexicanum" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "tokenizer": {
        "short_ngram_tokenizer": {
          "type": "ngram",
          "min_gram": 1,
          "max_gram": 4,
          "token_chars": ["letter", "digit"]
        },
        "long_ngram_tokenizer": {
          "type": "ngram",
          "min_gram": 5,
          "max_gram": 20,
          "token_chars": ["letter", "digit"]
        }
      },
      "analyzer": {
        "short_ngram_analyzer": {
          "type": "custom",
          "tokenizer": "short_ngram_tokenizer",
          "filter": ["lowercase"]
        },
        "long_ngram_analyzer": {
          "type": "custom",
          "tokenizer": "long_ngram_tokenizer",
          "filter": ["lowercase"]
        }
      }
    },
    "max_ngram_diff": 50
  },
  "mappings": {
    "properties": {
      "short_word": {
        "type": "text",
        "analyzer": "short_ngram_analyzer",
        "search_analyzer": "short_ngram_analyzer"
      },
      "long_word": {
        "type": "text",
        "analyzer": "long_ngram_analyzer",
        "search_analyzer": "long_ngram_analyzer"
      }
    }
  }
}
'
```

3. Populate data
```bash
python3 ./convert-text-to-index-json.py
curl -s -H "Content-Type: application/x-ndjson" -XPOST localhost:9200/_bulk --data-binary "@bulk_data.json"
```

4. Run some queries

### Queries
1. Get all
```bash
curl -X GET "localhost:9200/lexicanum/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  }
}
'
```


#### Word "wunschpunsch"
- [x] Correct word
- [x] <4 Errors (same place)
- [x] <4 Errors (different places)
- [x] 4+ Errors (different places)
- [ ] 4+ Errors (same place)

1. Correct one<br>
_Suggests:_ **wunschpunsch**
```bash
curl -X GET "localhost:9200/lexicanum/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "long_word": "wunschpunsch"
          }
        },
        {
          "fuzzy": {
            "long_word": {
              "value": "wunschpunsch"
            }
          }
        }
      ]
    }
  },
  "min_score": 5
}
'
```

2. 3 errors same place<br>
_Suggests:_ **wunschpunsch**
```bash
curl -X GET "localhost:9200/lexicanum/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "long_word": "wunochpunsoo"
          }
        },
        {
          "fuzzy": {
            "long_word": {
              "value": "wunochpunsoo"
            }
          }
        }
      ]
    }
  },
  "min_score": 5
}
'
```
3. 3 errors different places<br>
_Suggests:_ **wunschpunsch**
```bash
curl -X GET "localhost:9200/lexicanum/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "long_word": "wonocopunsch"
          }
        },
        {
          "fuzzy": {
            "long_word": {
              "value": "wonocopunsch"
            }
          }
        }
      ]
    }
  },
  "min_score": 5
}
'
```
4. 4 Errors (in different places)<br>
_Suggests:_ **Nothing**<br>
```bash
curl -X GET "localhost:9200/lexicanum/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "long_word": "wunochpunooo"
          }
        },
        {
          "fuzzy": {
            "long_word": {
              "value": "wunochpunooo"
            }
          }
        }
      ]
    }
  },
  "min_score": 5
}
'
```
 
4. 4 Errors (in single place)<br>
_Suggests:_ **wunschpunsch**<br>
_Kind of edge case_ Sadly for "inline" typos it's not working, because there are ngrams which still matches. Thought in real life people are less likely making those errors.  
```bash
curl -X GET "localhost:9200/lexicanum/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "long_word": "wunschpuoooo"
          }
        },
        {
          "fuzzy": {
            "long_word": {
              "value": "wunschpuoooo"
            }
          }
        }
      ]
    }
  },
  "min_score": 5
}
'
```