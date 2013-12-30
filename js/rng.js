function LotteryItem(object, tickets)
{
    var _object = object;
    var _tickets = parseInt(tickets);

    if (_.isNaN(_tickets))
        _tickets = 0;

    this.GetObject = function() { return _object; };
    this.GetTickets = function() { return _tickets; };
    this.CanUseTicket = function() { return _tickets > 0; };
    this.UseTicket = function()
    {
        if (_tickets > 0)
            _tickets--;
        return _tickets;
    };
}

function Lottery(existing)
{
    var _items = [];
    var _totalTickets = 0;

    //HACK
    this.GetItems = function() { return _items; };

    this.AddItem = function(object, tickets)
    {
        var item = new LotteryItem(object, tickets);

        //If tickets are invalid
        if (item.GetTickets() <= 0)
            return false; //Don't add it

        _totalTickets += item.GetTickets();
        _items.push(item);
        return true;
    };

    this.GetTotalTickets = function() { return _totalTickets; };

    this.Draw = function()
    {
        var ticket = Math.min(_totalTickets - 1, Math.round(Math.random()*_totalTickets));
        console.log(_totalTickets + ", " + ticket);
        var currentTicket = 0;
        var drawnItem = null;
        _items = _.filter(_items, function(item)
        {
            if (_.isNull(drawnItem) && currentTicket + item.GetTickets() >= ticket && item.CanUseTicket())
            {
                var remaining = item.UseTicket();
                drawnItem = item.GetObject();
                _totalTickets--;
                return remaining > 0;
            }
            currentTicket += item.GetTickets();
            return true;
        }, this);

        return drawnItem;
    };

    if (_.isObject(existing) && _.isFunction(existing.GetItems))
    {
        _.each(existing.GetItems(), function(item)
        {
            if (_.isFunction(item.GetObject) && _.isFunction(item.GetTickets))
                this.AddItem(item.GetObject(), item.GetTickets());
        }, this);
    }
}


$(function()
{
    var diceNumbers =
    {
        2: 1,
        3: 2,
        4: 3,
        5: 4,
        6: 5,
        7: 6,
        8: 5,
        9: 4,
        10: 3,
        11: 2,
        12: 1
    };

    var baseLottery = new Lottery();

    _.each(diceNumbers, function(tickets, result)
    {
        baseLottery.AddItem(result, tickets);
    });

    var currentLottery = new Lottery();

    var resultDiv = $("#result");
    var visualizeDiv = $("#visualize");

    var rollButton = $("#roll");
    var resetButton = $("#reset");

    var showVisualier = true;
    ToggleVisualizer();

    function ToggleVisualizer()
    {
        showVisualier = !showVisualier;
        visualizeDiv.css("display", showVisualier ? "inline" : "none");
    }

    $(document).keydown(function(event)
    {
        console.log(event.which);
        if (event.which == 86) //v.
            ToggleVisualizer();
        else if (event.which == 32)
            rollButton.click();
        else if (event.which == 82)
            resetButton.click();
    });

    function DrawVisualizer()
    {
        visualizeDiv.html("");
        _.each(currentLottery.GetItems(), function(item)
        {
            visualizeDiv.append(item.GetObject() + ": " + item.GetTickets() + "<br>");
        });
    }

    function ResetRolls()
    {
        currentLottery = new Lottery(baseLottery);
        DrawVisualizer();
    }

    function RollDice()
    {
        if (currentLottery.GetTotalTickets() <= 0)
            ResetRolls();

        var roll = currentLottery.Draw();

        var date = new Date();

        resultDiv.text("Result: " + roll + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());

        DrawVisualizer();
    }

    rollButton.click(RollDice);
    resetButton.click(function()
    {
        ResetRolls();
        RollDice();
        resultDiv.append(" - Reset.");
    });

    rollButton.click();
});























