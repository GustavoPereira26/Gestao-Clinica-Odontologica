using System.Text.Json;
using System.Text.Json.Serialization;

namespace DentusClinic.API.Attributes;

public class DateOnlyConverterLeniente : JsonConverter<DateOnly>
{
    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var valor = reader.GetString();
        return DateOnly.TryParse(valor, out var data) ? data : DateOnly.MinValue;
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
    }
}
