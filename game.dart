
import 'package:flutter/material.dart';

class Game extends StatefulWidget{
  Game({super.key, required this.title, required this.playerList});
  final String title;
  List<({int playerId, String playerName, int points, int result})> playerList;

  @override
  State<Game> createState() => _GameState();
}

class _GameState extends State<Game>{
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // TRY THIS: Try changing the color here to a specific color (to
        // Colors.amber, perhaps?) and trigger a hot reload to see the AppBar
        // change color while the other colors stay the same.
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Column(
              children: [
                SizedBox(
                  width: MediaQuery.of(context).size.width*0.5,
                  child: PointTable(playerList : widget.playerList),
                ),
                Calculator(playerList : widget.playerList),
              ],
            )
          ],
        ),
      ),
    );
  }
}



class PointTable extends StatefulWidget {
  PointTable({super.key, required this.playerList});
  List<({int playerId, String playerName, int points, int result})> playerList;


  @override
  State<PointTable> createState() => _PointTableState();
}

class _PointTableState extends State<PointTable>{

  final List<List<String>> dataList = [['A1', 'B1'], ['A2', 'B2'], ['A3', 'B3']];
  final List<DataColumn> _columns = [
    const DataColumn(label: Text('プレイヤー名',textAlign: TextAlign.center,)),
    const DataColumn(label: Text('点数',textAlign: TextAlign.center,)),
  ];

  @override
  Widget build(BuildContext context) {
      return DataTable(

        // border: TableBorder.all(),
        columns: _columns,
        rows: widget.playerList.map(
            (data) => DataRow(
                  cells: [
                    DataCell(Text(data.playerName,textAlign: TextAlign.center,)),
                    DataCell(Text(data.points.toString(),textAlign: TextAlign.center,))
                  ],
            )).toList(),
      );
  }
}

class Calculator extends StatefulWidget{
  Calculator({super.key, required this.playerList});
  List<({int playerId, String playerName, int points, int result})> playerList;

  @override
  State<Calculator> createState() => _CalculatorState();
}

class _CalculatorState extends State<Calculator>{

  List<int> hanList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  List<int> huList = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
  int han = 1;
  int hu = 20;
  int takerPlayerId = 1;
  int giverPlayerId = 2;
  int calc = 0;

  List<DropdownMenuItem<int>> getDropdownItem(List<int> dataList, String type){
    return dataList.map(
        (data) => DropdownMenuItem(
          value: data,
          child: Text('$data$type'),
          )
    ).toList();
  }

  int calculatePoints(){
    int point = 1;
    if(han>4){
      if(han<6){
        return 8000;
      }else if(han<8){
        return 12000;
      }else if(han<11){
        return 16000;
      }
    }
    for(int i=0;i<han+2;i++){
      point *= 2;
    }
    int basicPoint = hu * point;
    return ((basicPoint*4+99)~/100)*100;
  }

  @override
  Widget build(BuildContext context) {

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            DropdownButton(
                value: han,
                items: getDropdownItem(hanList, '翻'),
                onChanged: (newValue){
                  setState(() {
                    han = newValue as int;
                  });
                }),
            const Padding(padding: EdgeInsets.symmetric(horizontal: 10.0)),
            DropdownButton(
                value: hu,
                items: getDropdownItem(huList, '符'),
                onChanged: (newValue){
                  setState(() {
                    hu = newValue as int;
                  });
                }),
          ],
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('和了者'),
            const Padding(padding: EdgeInsets.symmetric(horizontal: 10.0)),
            DropdownButton(
                value: takerPlayerId,
                items: widget.playerList.map(
                  (player) => DropdownMenuItem(
                      value: player.playerId,
                      child: Text(player.playerName)
                  ),
                ).toList(),
              onChanged: (newValue){
                  setState(() {
                    takerPlayerId = newValue!;
                  });
              },
                ),
          ],
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('放銃者'),
            const Padding(padding: EdgeInsets.symmetric(horizontal: 10.0)),
            DropdownButton(
              value: giverPlayerId,
              items: widget.playerList.map(
                    (player) => DropdownMenuItem(
                    value: player.playerId,
                    child: Text(player.playerName)
                ),
              ).toList(),
              onChanged: (newValue){
                setState(() {
                  giverPlayerId = newValue!;
                });
              },
            ),
          ],
        ),
        ElevatedButton(
            onPressed: (){
              setState(() {
                calc = calculatePoints();
              });
            },
            child: const Text('計算'),
        ),
        Text(calc.toString()),
      ],
    );
  }

}